const crypto = require('crypto');
const Promise = require('bluebird');
const https = require('https');

const drmManager = require('./KalturaDrmManager');
const wvProto = require('../wv_proto_schema_pb');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const base = require('../KalturaBase');

class KalturaWidevineManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('cenc');
    }

    //TODO: save data to couchbase and check if it's there
    createEncryptionData(providerData, postParams)
    {
        let This = this;
        KalturaLogger.log("creating encrypiton data");
        //TODO: This needs to be run for every value of files.
        let sharedKey = "cenc" + "_" + postParams.account_id + "_" + postParams.content_id;

        if (typeof providerData.seed == 'undefined') {
            let commonSeedPromise = kalturaCouchbaseConnector.getInstance().get('udrm_common_seed', true);
            return commonSeedPromise.then(
                function (result) {
                    return [This.createNewEncryptionData(providerData, postParams, result.value.seed, sharedKey, false)];
                },
                function (err)
                {
                    KalturaLogger.error("Could not get udrm_common_seed");
                });
        }
        else {
            return new Promise(function(resolve,reject)
            {
                resolve([This.createNewEncryptionData(providerData, postParams, providerData.seed, sharedKey, false)]);
            });;
        }
    }
    
    createNewEncryptionData(providerData,postParams, seed, sharedKey, swap) {
        let seedBytes = Buffer.from(seed, 'base64').toString('binary');
        let md5 = crypto.createHash('md5');
        md5.update(seedBytes, 'binary');
        md5.update(sharedKey);
        md5.update(seedBytes, 'binary');
        let keyId = md5.digest('base64');
        let keyIdUnbase = Buffer.from(keyId, 'base64');
    
        let shaA = crypto.createHash('sha256');
        shaA.update(seedBytes, 'binary');
        shaA.update(keyIdUnbase, 'binary');
        let hashA = shaA.digest('binary');
        
        let shaB = crypto.createHash('sha256');
        shaB.update(seedBytes, 'binary');
        shaB.update(keyIdUnbase, 'binary');
        shaB.update(seedBytes, 'binary');
        let hashB = shaB.digest('binary');
        
        let shaC = crypto.createHash('sha256');
        shaC.update(seedBytes, 'binary');
        shaC.update(keyIdUnbase, 'binary');
        shaC.update(seedBytes, 'binary');
        shaC.update(keyIdUnbase, 'binary');
        let hashC = shaC.digest('binary');
        
        let key = "";
        for (let i = 0; i < 16; i++) {
            key += String.fromCharCode(hashA.charCodeAt(i) ^ hashA.charCodeAt(i + 16) ^
                hashB.charCodeAt(i) ^ hashB.charCodeAt(i + 16) ^
                hashC.charCodeAt(i) ^ hashC.charCodeAt(i + 16)
            );
        }
        
        key = Buffer.from(key,'binary').toString('base64');
    
        if (swap)
        {
            keyIdUnbase = keyIdUnbase[3]+keyIdUnbase[2]+keyIdUnbase[1]+keyIdUnbase[0]+keyIdUnbase[5]+keyIdUnbase[4]+keyIdUnbase[7]+keyIdUnbase[6]+keyIdUnbase.substr(8);
            keyId = Buffer.from(keyIdUnbase).toString('base64');
        }
    
        let retVal = {};
        retVal.key_id = keyId;
        retVal.key = key;
    
    
        retVal.pssh = [this.createPssh(keyIdUnbase, postParams['content_id'], providerData.provider, "SD_HD")];
        return retVal;
    }

    createPssh(keyIdBuf, contentId, provider, trackType)
    {
        var pssh = {};
        pssh.uuid = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
        let pssh_data = new wvProto.WidevineCencHeader();
        pssh_data.setAlgorithm(1);
        pssh_data.setKeyIdList([new Uint8Array(keyIdBuf.toString('binary').split("").map(function(c) {return c.charCodeAt(0);}))]);
        pssh_data.setProvider(provider);
        pssh_data.setContentId(new Uint8Array(contentId.split("").map(function(c) {return c.charCodeAt(0); })));
        pssh_data.setContentId(new Uint8Array(Buffer.from(contentId)));
        pssh_data.setTrackType(trackType);
        pssh.data = Buffer.from(pssh_data.serializeBinary(),'binary').toString('base64');
        return pssh;
    }


    getLicenseResponse(providerData, customData, payload, entResponse)
    {
        const base64Payload = Buffer.from(payload).toString('base64');
        let msg ={
            "payload": base64Payload,
            //"parse_only":True,
            "content_id": Buffer.from(customData.content_id).toString('base64'),
            "policy_overrides": null, //this._build_policy_overrides(providerData, customData, entResponse),
            "provider": providerData.provider,  
            "content_key_specs": null,//this._build_content_key_specs(customData),
            "allowed_track_types": "SD_HD"
        };
        let msgStr = JSON.stringify(msg);
        msgStr = '{"allowed_track_types": "SD_HD", "content_key_specs": [{"key_id": "gvBV+PjG5KotD4RAe0iSrA==", "track_type": "SD_HD", "key": "7imCtjuQz07Y/imNBWumCw=="}], "provider": "kaltura", "content_id": "MF9nNmQ4Mm91Zw==", "policy_overrides": {"license_duration_seconds": -1466347040, "can_play": true}, "payload": ""}';
        let signature = this._signRequest(msgStr, Buffer.from(providerData.key, 'base64'), Buffer.from(providerData.iv,'base64'));
        //TODO: Should I use JSON.stirngify here?
        let request = {signer:providerData.provider, signature:signature, request: Buffer.from(msgStr).toString('base64')};
        //let request = '{"request":'+JSON.stringify(msg)+',signature:'+signature+',signer:'+providerData.provider+'}';

        return new Promise(function(resolve, reject) {
            let licensePath = KalturaConfig.config.udrm.CENC_WIDEVINE_PATH + "/" + providerData.provider;
            let postReq = https.request({
                    method: 'POST',
                    protocol: KalturaConfig.config.udrm.CENC_WIDEVINE_PROTOCOL,
                    hostname: KalturaConfig.config.udrm.CENC_WIDEVINE_HOST,
                    path: licensePath
                },
                function (postResponse) {
                    var body = '';
                    postResponse.on('data', function (d) {
                        body += d;
                    });
                    postResponse.on('end', function () {
                        //TODO wrap JSON.parse in try/catch
                        var licResult = JSON.parse(body);
                        if (licResult.status != 'OK')
                        {
                            reject("License result not OK");
                            return;
                        }
                        resolve(Buffer.from(licResult.license, 'base64').toString('binary'))
                        });
                    });
            postReq.write(JSON.stringify(request));
            postReq.end();
            });
    }
    
    _signRequest(msgStr, key, iv)
    {
        let shaRequest = crypto.createHash('sha1');
        shaRequest.update(msgStr);
        let shaMsg = shaRequest.digest('binary');
        let signature = base.KalturaBase.prototype.encrypt(shaMsg, key, iv);
        return signature;
    }

}

module.exports.KalturaWidevineManager = KalturaWidevineManager;