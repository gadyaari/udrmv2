var GE = require('../lib/entitlement/GenericEntitlement');
var OVP = require('../lib/entitlement/OVPEntitlement');

exports.testSomething = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

exports.testOVPEntitlement = function(test) {
    test.expect(3);
    var ks = "YjkzYzY0ZDE3NTQ5NzhkZjdmM2VjOGFhZTBiMDg5MDc4ZGYzZGVmY3wxMDI7MTAyOzE0NjU1Njk5NDE7MjsxNDY1NDgzNTQxLjQzOTU7ZGF2aWQud2luZGVyQGthbHR1cmEuY29tOyosZGlzYWJsZWVudGl0bGVtZW50Ozs=";
    var customData = {"ca_system":"OTT","user_token":ks,"account_id":1982551,"content_id":"0_wsgv6s7h_0_sxsts283,0_wsgv6s7h_0_koa2swtn","files":"","udid":"6f541a81fb2d7328"}
    var ovp = new OVP("192.168.56.101",customData);

    var entitlement = ovp.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == 0, "duration!");
            test.ok(result.absolute_duration == 0, "absolute_duration!");
            test.ok(result.policy == "", "policy!");
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};


