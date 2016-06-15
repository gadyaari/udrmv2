var util = require('util');
var crypto = require("crypto");
var Promise = require('bluebird');

var drmManager = require('./KalturaDrmManager');
var wvProto = require('../wv_proto_schema_pb');
require('../KalturaBase');
//var kaltura = module.exports = require('../KalturaBase');
class KalturaWidevineManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('widevine');
    }

    createEncryptionData(providerData, postParams)
    {
        var This = this;
        KalturaLogger.log("creating encrypiton data");
        //TODO: This needs to be run for every value of files.
        var sharedKey = "cenc" + "_" + postParams.account_id + "_" + postParams.content_id;

        providerData.seed = "rJmT2nTj7acd99aNpVjDYuRPs8tHGt6q80yWpaLA";
        if (typeof providerData.seed == 'undefined') {
            var commonSeedPromise = KalturaCouchbaseConnector.getInstance().get('udrm_common_seed', true);
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
        var seedBytes = new Buffer(seed, 'base64').toString('binary');
        var md5 = crypto.createHash('md5');
        md5.update(seedBytes);
        md5.update(sharedKey);
        var keyId = md5.digest('base64');
        var keyIdUnbase = new Buffer(keyId, 'base64').toString('ascii');
    
        var shaA = crypto.createHash('sha256');
        shaA.update(seedBytes);
        shaA.update(keyIdUnbase);
        var hashA = shaA.digest('binary');
    
        var shaB = crypto.createHash('sha256');
        shaB.update(seedBytes);
        shaB.update(keyIdUnbase);
        shaB.update(seedBytes);
        var hashB = shaB.digest('binary');
    
        var shaC = crypto.createHash('sha256');
        shaC.update(seedBytes);
        shaC.update(keyIdUnbase);
        shaC.update(seedBytes);
        shaC.update(keyIdUnbase);
        var hashC = shaC.digest('binary');
    
        var key = "";
        for (var i = 0; i < 16; i++) {
            key += String.fromCharCode(hashA.charCodeAt(i) ^ hashA.charCodeAt(i + 16) ^
                hashB.charCodeAt(i) ^ hashB.charCodeAt(i + 16) ^
                hashC.charCodeAt(i) ^ hashC.charCodeAt(i + 16)
            );
        }
        key = new Buffer(key).toString('base64');
    
        if (swap)
        {
            keyIdUnbase = keyIdUnbase[3]+keyIdUnbase[2]+keyIdUnbase[1]+keyIdUnbase[0]+keyIdUnbase[5]+keyIdUnbase[4]+keyIdUnbase[7]+keyIdUnbase[6]+keyIdUnbase.substr(8);
            keyId = new Buffer(keyIdUnbase).toString('base64');
        }
    
        var retVal = {};
        retVal.key_id = keyId;
        retVal.key = key;
    
    
        retVal.pssh = [this.createPssh(keyIdUnbase, postParams['content_id'], providerData.provider, "SD_HD")];
        return retVal;
    }

    createPssh(keyIdBuf, contentId, provider, trackType)
    {
        var pssh = {};
        pssh.uuid = "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
        var pssh_data = new wvProto.WidevineCencHeader();
        pssh_data.setKeyIdList([new Uint8Array(keyIdBuf.split("").map(function(c) {return c.charCodeAt(0);}))]);
        pssh_data.setProvider(provider);
        pssh_data.setContentId(new Uint8Array(contentId.split("").map(function(c) {return c.charCodeAt(0); })));
        pssh_data.setTrackType(trackType);
        pssh.data = new Buffer(pssh_data.serializeBinary()).toString('base64');
        return pssh;
    }
}

module.exports.KalturaWidevineManager = KalturaWidevineManager;