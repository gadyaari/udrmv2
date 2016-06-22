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
            });
        }
    }
    
    createNewEncryptionData(providerData,postParams, seed, sharedKey, swap) 
    {
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


    getLicenseResponse(providerData, customData, payload, entResponse, files)
    {
        let This = this;
        const base64Payload = Buffer.from(payload).toString('base64');
        //TODO get encryption data from CB.
        //let encryptionData = [{'key_id': 'gvBV+PjG5KotD4RAe0iSrA==', 'pssh': [{'data': 'CAESEILwVfj4xuSqLQ+EQHtIkqwaB2thbHR1cmEiCjBfZzZkODJvdWcqBVNEX0hE', 'uuid': 'edef8ba9-79d6-4ace-a3c8-27dcd51d21ed'}, {'data': 'yAIAAAEAAQC+AjwAVwBSAE0ASABFAEEARABFAFIAIAB4AG0AbABuAHMAPQAiAGgAdAB0AHAAOgAvAC8AcwBjAGgAZQBtAGEAcwAuAG0AaQBjAHIAbwBzAG8AZgB0AC4AYwBvAG0ALwBEAFIATQAvADIAMAAwADcALwAwADMALwBQAGwAYQB5AFIAZQBhAGQAeQBIAGUAYQBkAGUAcgAiACAAdgBlAHIAcwBpAG8AbgA9ACIANAAuADAALgAwAC4AMAAiAD4APABEAEEAVABBAD4APABQAFIATwBUAEUAQwBUAEkATgBGAE8APgA8AEsARQBZAEwARQBOAD4AMQA2ADwALwBLAEUAWQBMAEUATgA+ADwAQQBMAEcASQBEAD4AQQBFAFMAQwBUAFIAPAAvAEEATABHAEkARAA+ADwALwBQAFIATwBUAEUAQwBUAEkATgBGAE8APgA8AEsASQBEAD4AKwBGAFgAdwBnAHMAYgA0AHEAdQBRAHQARAA0AFIAQQBlADAAaQBTAHIAQQA9AD0APAAvAEsASQBEAD4APABDAEgARQBDAEsAUwBVAE0APgA2AGEANABmAE4AWgBzAEIAegBUAFUAPQA8AC8AQwBIAEUAQwBLAFMAVQBNAD4APABMAEEAXwBVAFIATAA+AGgAdAB0AHAAOgAvAC8AdQBiAHUAbgB0AHUAZAByAG0ALwBjAGUAbgBjAC8AcABsAGEAeQByAGUAYQBkAHkALwBsAGkAYwBlAG4AcwBlADwALwBMAEEAXwBVAFIATAA+ADwATABVAEkAXwBVAFIATAA+AGgAdAB0AHAAOgAvAC8AdwB3AHcALgBrAGEAbAB0AHUAcgBhAC4AYwBvAG0APAAvAEwAVQBJAF8AVQBSAEwAPgA8AC8ARABBAFQAQQA+ADwALwBXAFIATQBIAEUAQQBEAEUAUgA+AA==', 'uuid': '9a04f079-9840-4286-ab92-e65be0885f95'}], 'content_id': '0_g6d82oug', 'key': '7imCtjuQz07Y/imNBWumCw==', 'file': '0_cftajt0x'}];
        let dbPrefix = this._drmType + '_' + customData.account_id;
        let contentKeys = this._getFiles(customData, files, dbPrefix);
        let encryptionDataPromise = kalturaCouchbaseConnector.getInstance().getMulti(contentKeys, true);
        
        return new Promise(function(resolve,reject) {
            encryptionDataPromise.then(
                function (encryptionData) {
                    let msg = {
                        "payload": base64Payload,
                        //"parse_only":True,
                        "content_id": Buffer.from(customData.content_id).toString('base64'),
                        "policy_overrides": This._build_policy_overrides(providerData, customData, entResponse),
                        "provider": providerData.provider,
                        "content_key_specs": This._build_content_key_specs(encryptionData, customData),
                        "allowed_track_types": "SD_HD"
                    };
                    let msgStr = JSON.stringify(msg);
                    let signature = This._signRequest(msgStr, Buffer.from(providerData.key, 'base64'), Buffer.from(providerData.iv, 'base64'));
                    let request = {
                        signer: providerData.provider,
                        signature: signature,
                        request: Buffer.from(msgStr).toString('base64')
                    };
                    //let request = '{"request":'+JSON.stringify(msg)+',signature:'+signature+',signer:'+providerData.provider+'}';
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
                                if (licResult.status != 'OK') {
                                    reject("License result not OK");
                                    return;
                                }
                                resolve(Buffer.from(licResult.license, 'base64').toString('binary'))
                            });
                        });
                    postReq.write(JSON.stringify(request));
                    postReq.end();
                },
                function (err) {
                    KalturaLogger.error("Could not get all keys from DB");
                }
            );
        });
    }
    
    _signRequest(msgStr, key, iv)
    {
        let shaRequest = crypto.createHash('sha1');
        shaRequest.update(msgStr);
        let shaMsg = shaRequest.digest('binary');
        for (let i = shaMsg.length; i<32; i++)
        {
            shaMsg += String.fromCharCode(0x00);
        }
        
        let signature = base.KalturaBase.prototype.encrypt(shaMsg, key, {iv:iv, disablePadding:true});
        return signature;
    }

    _build_policy_overrides(providerData, customData, entResponse)
    {
        let policyOverrides = {};
        policyOverrides['can_play'] = true;
        policyOverrides['license_duration_seconds'] = entResponse.duration;
        //TODO Should I implement the logic that takes overrides from the policy? Where would I get it from?
        return policyOverrides;
    }

    _build_content_key_specs(encryptionData, customData)
    {
        let contentKeySpecs = [];
        for (let contentKey in encryptionData)
        {
            let currContentKeySpec = {};
            currContentKeySpec.track_type = 'SD_HD';
            currContentKeySpec.key = encryptionData[contentKey].value.key;
            currContentKeySpec.key_id = encryptionData[contentKey].value.key_id;
            contentKeySpecs.push(currContentKeySpec);
        }
        return contentKeySpecs;
    }

    _getFiles(customData, files, dbPrefix)
    {
        if (typeof customData.files == 'undefined')
            return customData.content_id.map(function(curr, index, arr){return dbPrefix + '_' + curr;});
        let verifiedFilesArr = customData.files.split(',');
        if (typeof files == 'undefined')
            return verifiedFilesArr.map(function(curr, index, arr){return dbPrefix + '_' + customData.content_id + '_' + curr;});
        
        let retVal = [];
        let filesArr = Buffer.from(files, 'base64').toString('ascii').split(',');
        for (let i = 0; i < filesArr.length; i++)
        {
            if (verifiedFilesArr.indexOf(filesArr[i]) != -1)
                retVal.push(dbPrefix + '_' + customData.content_id + '_' + filesArr[i]);
            else
                return new Error("Files cannot be verified");
        }
        return retVal;
    }
    
}

module.exports.KalturaWidevineManager = KalturaWidevineManager;