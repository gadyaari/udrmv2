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
        //test.expect(1);
        var cbCB = function(err, result)
        {
            if (err)
            {
                test.ok(false);
            }
            else {
                test.ok(true, "upsert from CB works");
            }
            test.done();
        };
        
        KalturaCouchbaseConnector.upsert('test_key', {'test_value':'other_side_of_json'}, true, cbCB);
    },
    
    testGet: function(test) {
        KalturaCouchbaseConnector.get('test_key', true, function (err,result) {
            test.equal(result.value.test_value, 'other_side_of_json');
            test.ok(true, "Get from CB works");
            test.done();
        });
    }
};
