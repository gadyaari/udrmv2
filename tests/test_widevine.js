var util = require('util');
var widevine = require('../lib/managers/KalturaWidevineManager');
const Promise = require('bluebird');

exports.testSomething = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testWidevine =
{
    setUp: function (callback) {
        //KalturaCouchbaseConnector.getInstance();
        callback();
    },

    tearDown: function (callback) {
        KalturaLogger.log("tearDown is called");
        callback();
    },
    
    encryption:function(test)
    {
        test.expect(8);
        var providerData = {
            key: 'b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=',
            iv: 'h3jAqQOGlps/swgz5b0Kww==',
            provider: 'kaltura',
            provider_sign_key: 'jernkVsZ6j3LheMnStCAVmSncyXDBBmVSGfcWr1WQAA='
        };
    
        var postParams = {
            "files": "0_cftajt0x",
            "content_id": "0_g6d82oug",
            "ca_system": "ovp",
            "account_id": "2621"
        };

        function success(result)
        {
            //console.log("@@NA got result ["+util.inspect(result)+"]");
            for (let resKey=0; resKey<result.length; resKey++) 
            {
                test.equal(result[resKey][0].key_id, "ongd6sHs/QaD1tk2RbYsMg==");
                test.equal(result[resKey][0].key, "vYSe0cNYP1gMfaG80yiIpg==");
                test.equal(result[resKey][0].pssh[0].uuid, "edef8ba9-79d6-4ace-a3c8-27dcd51d21ed");
                test.equal(result[resKey][0].pssh[0].data, "CAESEKJ4HerB7P0Gg9bZNkW2LDIaB2thbHR1cmEiCjBfZzZkODJvdWcqBVNEX0hE");
            }
        };
        function notScucess(error)
        {
            //console.log("@@NA got error "+util.inspect(error));
            test.ok(false, JSON.stringify(error));
        };

        var wvManager = new widevine.KalturaWidevineManager();
        var encryptionDataPromise = wvManager.createEncryptionData(providerData, postParams);
        
        //encryptionDataPromise.then(success,notScucess);
        providerData.seed = 'rJmT2nTj7acd99aNpVjDYuRPs8tHGt6q80yWpaLA'
        var encryptionDataPromise2 = wvManager.createEncryptionData(providerData, postParams);
        //encryptionDataPromise2.then(success,notScucess);
        
        let allPromises = Promise.all([encryptionDataPromise, encryptionDataPromise2]);
        allPromises.then(success, notScucess);
        allPromises.finally(function(){test.done();});
        
    }
};