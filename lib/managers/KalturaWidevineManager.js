var util = require('util');
var crypto = require("crypto");

var drmManager = require('./KalturaDrmManager');
var kaltura = module.exports = require('../KalturaBase');

var KalturaWidevineManager = function(){
    KalturaWidevineManager.super_.apply(this, ['widevine']);
};

util.inherits(KalturaWidevineManager, drmManager.KalturaDrmManager);

KalturaWidevineManager.prototype.start = function(){
    this.run = true;
};

KalturaWidevineManager.prototype.stop = function(){
    this.run = false;
};

KalturaWidevineManager.prototype.createEncryptionData = function(providerData, postParams)
{
    var This = this;
    KalturaLogger.log("creating encrypiton data");
    ret_val = [{
        "key_id": "FNrV3KUFsH5/mN2rPPOr9g==",
        "pssh": [{
            "data": "CAESEBTa1dylBbB+f5jdqzzzq/YaB2thbHR1cmEiCjBfZzZkODJvdWcqBVNEX0hE",
            "uuid": "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed"
        },
            {
                "data": "yAIAAAEAAQC+AjwAVwBSAE0ASABFAEEARABFAFIAIAB4AG0AbABuAHMAPQAiAGgAdAB0AHAAOgAvAC8AcwBjAGgAZQBtAGEAcwAuAG0AaQBjAHIAbwBzAG8AZgB0AC4AYwBvAG0ALwBEAFIATQAvADIAMAAwADcALwAwADMALwBQAGwAYQB5AFIAZQBhAGQAeQBIAGUAYQBkAGUAcgAiACAAdgBlAHIAcwBpAG8AbgA9ACIANAAuADAALgAwAC4AMAAiAD4APABEAEEAVABBAD4APABQAFIATwBUAEUAQwBUAEkATgBGAE8APgA8AEsARQBZAEwARQBOAD4AMQA2ADwALwBLAEUAWQBMAEUATgA+ADwAQQBMAEcASQBEAD4AQQBFAFMAQwBUAFIAPAAvAEEATABHAEkARAA+ADwALwBQAFIATwBUAEUAQwBUAEkATgBGAE8APgA8AEsASQBEAD4AMwBOAFgAYQBGAEEAVwBsAGYAcgBCAC8AbQBOADIAcgBQAFAATwByADkAZwA9AD0APAAvAEsASQBEAD4APABDAEgARQBDAEsAUwBVAE0APgB2AEUAbABJAFQASQB4AHoAcgBLAEUAPQA8AC8AQwBIAEUAQwBLAFMAVQBNAD4APABMAEEAXwBVAFIATAA+AGgAdAB0AHAAOgAvAC8AdQBiAHUAbgB0AHUAZAByAG0ALwBjAGUAbgBjAC8AcABsAGEAeQByAGUAYQBkAHkALwBsAGkAYwBlAG4AcwBlADwALwBMAEEAXwBVAFIATAA+ADwATABVAEkAXwBVAFIATAA+AGgAdAB0AHAAOgAvAC8AdwB3AHcALgBrAGEAbAB0AHUAcgBhAC4AYwBvAG0APAAvAEwAVQBJAF8AVQBSAEwAPgA8AC8ARABBAFQAQQA+ADwALwBXAFIATQBIAEUAQQBEAEUAUgA+AA==",
                "uuid": "9a04f079-9840-4286-ab92-e65be0885f95"
            }],
        "content_id": "0_g6d82oug",
        "key": "JAS3Kkp1VYdDxrcHtNo54A==",
        "file": "0_cftajt0x"
    }];

    //TODO: This needs to be run for every value of files.
    var sharedKey = this.drmType + "_" + postParams.account_id + "_" + postParams.content_id;

    if (typeof providerData.seed == 'undefined') {
        KalturaCouchbaseManager.get('udrm_common_seed', true, function (err, result) {
            var newEncryptionData = This.createNewEncryptionData(providerData, postParams, result.value, sharedKey, false);
        });
    }
    else {
        var newEncryptionData = This.createNewEncryptionData(providerData, postParams, providerData.seed, sharedKey, false);
    }
    
    return newEncryptionData;
}

KalturaWidevineManager.prototype.createNewEncryptionData = function(providerData,postParams, seed, sharedKey, swap) {
    var seedBytes = new Buffer(seed, 'base64').toString('ascii');
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
    var hashB = shaB.digest();

    var shaC = crypto.createHash('sha256');
    shaC.update(seedBytes);
    shaC.update(keyIdUnbase);
    shaC.update(seedBytes);
    shaC.update(keyIdUnbase);
    var hashC = shaC.digest();

    var key = "";
    for (i = 0; i < 16; i++) {
        key += String.fromCharCode(hashA.charCodeAt(i) ^ hashA.charCodeAt(i + 16) ^
                                   hashB.charCodeAt(i) ^ hashB.charCodeAt(i + 16) ^
                                   hashC.charCodeAt(i) ^ hashC.charCodeAt(i + 16)
        );
    }
    
    if (swap)
    {
        keyIdUnbase = keyIdUnbase[3]+keyIdUnbase[2]+keyIdUnbase[1]+keyIdUnbase[0]+keyIdUnbase[5]+keyIdUnbase[4]+keyIdUnbase[7]+keyIdUnbase[6]+keyIdUnbase.substr(8);
        keyId = new Buffer(keyIdUnbase).toString('base64');
    }
    
    retVal = {};
    retVal.keyId = keyId;
    retVal.key = key;
    retVal.pssh = 'still to come';
    return retVal;
}


module.exports.KalturaWidevineManager = KalturaWidevineManager;