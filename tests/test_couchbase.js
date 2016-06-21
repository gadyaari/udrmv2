var Promise = require('bluebird');
var util = require('util');
var kalturaCouchbaseConnector = require('../lib/utils/KalturaCouchbaseConnector');

exports.testSomething = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testCouchbaseConnector =
{
    setUp: function (callback) {
        KalturaLogger.log("setUp is called");
        kalturaCouchbaseConnector.getInstance();
        callback();
    },

    tearDown: function (callback) {
        KalturaLogger.log("tearDown is called");
        callback();
    },

    testUpsert: function (test) {
        test.expect(1);
        var upsert = kalturaCouchbaseConnector.getInstance().upsert('test_key', {'test_value':'other_side_of_json'}, true);
        upsert.then(
            function(result)
            {
                test.ok(true, "upsert from CB works");
            },
            function(err)
            {
                test.ok(false);
            }
        );
        upsert.finally(function () {test.done();});
    },
    
    testGet: function(test) {
        test.expect(1);
        var testKey = kalturaCouchbaseConnector.getInstance().get('test_key', true);
        testKey.then(
            function(result){
                test.equal(result.value.test_value, 'other_side_of_json',"OK");
            },
            function(err)
            {
                test.ok(false, "Got error from CB");
            }
        );
        testKey.finally(function(){test.done();});
    },
    
    testGetMulti: function(test)
    {
        test.expect(2);
        let multiPromise = kalturaCouchbaseConnector.getInstance().getMulti(['cenc_101','cenc_2621','doesntexists what erfw'],true);
        multiPromise.then(
            function(results)
            {
                test.equal(results['cenc_101'].value.provider_sign_key, 'jernkVsZ6j3LheMnStCAVmSncyXDBBmVSGfcWr1WQAA=',"provider sign key of cenc_101 is OK");
                test.equal(results['cenc_2621'].value['key'], 'b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=', "key of 2621 is OK");
            },
            function(err)
            {
                console.log("wwwwhhhhhhhhhhaaaaaatttttt");
                test.ok(false, 'Got error from CB ['+util.inspect+']');
            }
        );
        multiPromise.finally(function(){test.done()});
    }
};
