var cb = require('../lib/utils/KalturaCouchbaseConnector');

exports.testSomething = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

//exports.testSomethingElse = function(test) {
//    test.ok(false, "this assertion should fail");
//    test.done();
//};

exports.testCouchbaseConnector =
{
    setUp: function (callback) {
        KalturaLogger.log("setUp is called");
        cb.KalturaCouchbaseConnector.init();
        callback();
    },

    tearDown: function (callback) {
        KalturaLogger.log("tearDown is called");
        callback();
    },

    testUpsert: function (test) {
        //test.expect(1);
        cb.KalturaCouchbaseConnector.upsert('test_key', {'test_value':'other_side_of_json'}, function(err, result){
            if (err)
            {
                test.ok(false);
            }
            else {
                test.ok(true, "upsert from CB works");
            }
            test.done();
        });
    },
    
    testGet: function(test) {
        cb.KalturaCouchbaseConnector.get('test_key', function (err,result) {
            test.equal(result.value.test_value, 'other_side_of_json');
            test.ok(true, "Get from CB works");
            test.done();
        });
    }
};
