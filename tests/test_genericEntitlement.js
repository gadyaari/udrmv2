/**
 * This is set of test for all entitlement files
 * Created by David.Winder on 6/14/2016.
 */
require('util');

require('../lib/utils/KalturaConfig');
var OVP = require('../lib/entitlement/OVPEntitlement');
var MOCK = require('../lib/entitlement/GenericEntitlementMock');

var WRONG_DURATION_MESSAGE = "wrong duration!";
var WRONG_ABSOLUTE_DURATION_MESSAGE = "wrong absolute_duration!";
var WRONG_POLICY_MESSAGE = "wrong absolute_duration!";

var KS = KalturaConfig.config.udrm.KS;
var SERVER = KalturaConfig.config.udrm.OVPSERVER;
console.log("Starting tests with IP: " + SERVER);


//this test is just to see that the file is running and OK
exports.testExample = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

// this test create OVPEntitlement and send requet for OVP server
// answer is {0,0,None} because there is no such entryID
exports.testOVPEntitlement = function(test) {
    test.expect(3);

    var customData = {"ca_system":"OTT","user_token":KS,"account_id":1982551,"content_id":"0_wsgv6s7h_0_sxsts283,0_wsgv6s7h_0_koa2swtn","files":"","udid":"6f541a81fb2d7328"}
    var ovp = new OVP(SERVER,customData);

    var entitlement = ovp.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == 0, WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == 0, WRONG_ABSOLUTE_DURATION_MESSAGE);
            test.ok(result.policy == "", WRONG_POLICY_MESSAGE);
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};

//this test the OVPEntitlement in Mock condition
//he check for getting back the default value define as static in OVPMockEntitlement
exports.testOVPMockEntitlement = function(test) {
    test.expect(3);
    var customData = {"ca_system":"OVP","user_token":"","account_id":1982551,"content_id":"0_wsgv6s7h_0_sxsts283,0_wsgv6s7h_0_koa2swtn","files":"","udid":"6f541a81fb2d7328"}
    var mock = new MOCK(SERVER,customData);

    var entitlement = mock.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == "15000", WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == "15000", WRONG_ABSOLUTE_DURATION_MESSAGE);
            test.ok(result.policy == "None", WRONG_POLICY_MESSAGE);
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};

//this test the OTTEntitlement in Mock condition
//he check for getting back the default value define as static in OTTMockEntitlement
exports.testOTTMockEntitlement = function(test) {
    test.expect(3);
    var customData = {"ca_system":"OTT","user_token":"","account_id":1982551,"content_id":"0_wsgv6s7h_0_sxsts283,0_wsgv6s7h_0_koa2swtn","files":"","udid":"6f541a81fb2d7328"}
    var mock = new MOCK(SERVER,customData);

    var entitlement = mock.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == "4.06:08:18.8530000", WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == "4.06:08:18.8530000", WRONG_ABSOLUTE_DURATION_MESSAGE);
            test.ok(result.policy == "None", WRONG_POLICY_MESSAGE);
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};