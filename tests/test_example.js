var Promise = require('bluebird');
require('../lib/utils/KalturaCouchbaseConnector');

exports.testSomething = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testCouchbaseConnector =
{
    setUp: function (callback) {
        KalturaLogger.log("setUp is called");
        KalturaCouchbaseConnector.init();
        callback();
    },

    tearDown: function (callback) {
        KalturaLogger.log("tearDown is called");
        callback();
    },

    testUpsert: function (test) {
        test.expect(1);
        var upsert = KalturaCouchbaseConnector.upsert('test_key', {'test_value':'other_side_of_json'}, true);
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
        var testKey = KalturaCouchbaseConnector.get('test_key', true);
        testKey.then(
            function(result){
                test.equal(result.value.test_value, 'other_side_of_json');
            },
            function(err)
            {
                test.ok(false, "Got error from CB");
            }
        );
        testKey.finally(function(){test.done()});
    }
};
