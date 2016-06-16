let util = require('util');
let crypto = require("crypto");
let Promise = require('bluebird');
let drmManager = require('./KalturaDrmManager');
let wvProto = require('../wv_proto_schema_pb');
let kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector')


require('../KalturaBase');
//let kaltura = module.exports = require('../KalturaBase');
class KalturaWidevineManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('widevine');
    }

    createEncryptionData(providerData, postParams)
    {
        let This = this;
        KalturaLogger.log("creating encrypiton data");
        //TODO: This needs to be run for every value of files.
        let sharedKey = "cenc" + "_" + postParams.account_id + "_" + postParams.content_id;

        providerData.seed = "rJmT2nTj7acd99aNpVjDYuRPs8tHGt6q80yWpaLA";
        if (typeof providerData.seed == 'undefined') {
            let commonSeedPromise = kalturaCouchbaseConnector.getInstance().get('udrm_common_seed', true);
            return commonSeedPromise.then(
                function (result) {
                    return [This.createNewEncryptionData(providerData, postParams, result.value, sharedKey, false)];
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
        //pssh_data.setKeyIdList(new Uint8Array(keyIdBuf));
        pssh_data.setProvider(provider);
        pssh_data.setContentId(new Uint8Array(contentId.split("").map(function(c) {return c.charCodeAt(0); })));
        pssh_data.setContentId(new Uint8Array(Buffer.from(contentId)));
        pssh_data.setTrackType(trackType);
        pssh.data = Buffer.from(pssh_data.serializeBinary(),'binary').toString('base64');
        return pssh;
    }
}

module.exports.KalturaWidevineManager = KalturaWidevineManager;