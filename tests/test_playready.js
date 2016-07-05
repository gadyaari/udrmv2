const util = require('util');
const playready = require('../lib/managers/KalturaPlayreadyManager');
const kalturaWidevineManager = require('../lib/managers/KalturaWidevineManager');
const Promise = require('bluebird');

exports.testSomething = function (test) {
    test.expect(1);
    test.ok(true, 'this assertion should pass');
    test.done();
};

exports.testPlayready =
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
            key: KalturaConfig.config.tests.playready.key,
            iv: KalturaConfig.config.tests.playready.iv,
            provider: KalturaConfig.config.tests.playready.provider,
            provider_sign_key: KalturaConfig.config.tests.playready.provider_sign_key,
        };

        const postParams = {
            files: KalturaConfig.config.tests.playready.files,
            content_id: KalturaConfig.config.tests.playready.content_id,
            ca_system: KalturaConfig.config.tests.playready.ca_system,
            account_id: KalturaConfig.config.tests.playready.account_id,
        };

        function success(result)
        {
            //console.log(`@@NA got result [${util.inspect(result[0])}]`);
            for (let resKey = 0; resKey < result.length; resKey++)
            {
                //console.log(`got pssh [${util.inspect(result[resKey][0].pssh)}`);
                test.equal(result[resKey][0].key_id, KalturaConfig.config.tests.playready.expected_keyId);
                test.equal(result[resKey][0].key, KalturaConfig.config.tests.playready.expected_key );
                test.equal(result[resKey][0].pssh[0].uuid, KalturaConfig.config.tests.playready.expected_uuid);
                test.equal(result[resKey][0].pssh[0].data, KalturaConfig.config.tests.playready.expected_data);
            }
        }
        function notScucess(error)
        {
            //console.log('@@NA got error '+util.inspect(error));
            test.ok(false, JSON.stringify(error));
        }

        const prManager = new playready.KalturaPlayreadyManager();
        new kalturaWidevineManager.KalturaWidevineManager();
        const encryptionDataPromise = prManager.createEncryptionData(providerData, postParams);

        providerData.seed = KalturaConfig.config.tests.playready.seed;
        const encryptionDataPromise2 = prManager.createEncryptionData(providerData, postParams);

        const allPromises = Promise.all([encryptionDataPromise, encryptionDataPromise2]);
        allPromises.then(success, notScucess);

        function testDone()
        {
            test.done();
        }

        allPromises.finally(testDone);
    },
};
