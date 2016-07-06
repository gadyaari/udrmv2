const util = require('util');
const widevine = require('../lib/managers/KalturaWidevineManager');
const Promise = require('bluebird');

exports.testSomething = function (test)
{
    test.expect(1);
    test.ok(true, 'this assertion should pass');
    test.done();
};

exports.testWidevine =
{
    setUp: function (callback)
    {
        //KalturaCouchbaseConnector.getInstance();
        callback();
    },

    tearDown: function (callback)
    {
        KalturaLogger.log('tearDown is called');
        callback();
    },

    encryption: function (test)
    {
        test.expect(8);
        const providerData = {
            key: KalturaConfig.config.tests.widevine.key,
            iv: KalturaConfig.config.tests.widevine.iv,
            provider: KalturaConfig.config.tests.widevine.provider,
            provider_sign_key: KalturaConfig.config.tests.widevine.provider_sign_key,
        };

        const postParams = {
            files: KalturaConfig.config.tests.widevine.files,
            content_id: KalturaConfig.config.tests.widevine.content_id,
            ca_system: KalturaConfig.config.tests.widevine.ca_system,
            account_id: KalturaConfig.config.tests.widevine.account_id,
        };


        function success(result)
        {
            //console.log(`@@NA got result [${util.inspect(result)}]`);
            for (let resKey = 0; resKey < result.length; resKey++)
            {
                test.equal(result[resKey][0].key_id, KalturaConfig.config.tests.widevine.expected_keyId);
                test.equal(result[resKey][0].key, KalturaConfig.config.tests.widevine.expected_key );
                test.equal(result[resKey][0].pssh[0].uuid, KalturaConfig.config.tests.widevine.expected_uuid);
                test.equal(result[resKey][0].pssh[0].data, KalturaConfig.config.tests.widevine.expected_data);
            }
        }
        function notScucess(error)
        {
            //console.log("@@NA got error "+util.inspect(error));
            test.ok(false, JSON.stringify(error));
        }

        const wvManager = new widevine.KalturaWidevineManager();
        const encryptionDataPromise = wvManager.createEncryptionData(providerData, postParams);

        //encryptionDataPromise.then(success,notScucess);
        providerData.seed = KalturaConfig.config.tests.widevine.seed;
        const encryptionDataPromise2 = wvManager.createEncryptionData(providerData, postParams);
        //encryptionDataPromise2.then(success,notScucess);

        const allPromises = Promise.all([encryptionDataPromise, encryptionDataPromise2]);
        allPromises.then(success, notScucess);
        allPromises.finally(
            function ()
            {
                test.done();
            }
        );
    },
};
