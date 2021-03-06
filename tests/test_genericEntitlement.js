/**
 * This is set of test for all entitlement files
 * Created by David.Winder on 6/14/2016.
 */
require('util');

require('../lib/utils/KalturaConfig');
var GE = require('../lib/entitlement/GenericEntitlement');
var EntitlementFactory = require('../lib/entitlement/EntitlementFactory');
var KalturaProviderData = require('../lib/KalturaProviderData');
var OVP = require('../lib/entitlement/OVPEntitlement');
var OTT = require('../lib/entitlement/OTTEntitlement');
var MOCK = require('../lib/entitlement/GenericEntitlementMock');


var WRONG_DURATION_MESSAGE = "wrong duration!";
var WRONG_ABSOLUTE_DURATION_MESSAGE = "wrong absolute_duration!";
var WRONG_POLICY_MESSAGE = "wrong absolute_duration!";

var KS = KalturaConfig.config.udrm.KS;

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

    var customData = {"ca_system":"OVP","user_token":KS,"account_id":"","content_id":"1_6ojmokuo_1_73eztmlo,1_6ojmokuo_1_00n1ga1a,1_6ojmokuo_1_pls78sme,1_6ojmokuo_1_xg79vol6","files":"","udid":""};
    var drmType = false;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);
    
    var ovp = new OVP(customData, providerData);

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
            console.log("catch here! at the end");
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};


// this test create OTTEntitlement and send requet for OTT server
// answer is {0,0,None} because there is no such entryID
exports.testOTTEntitlement = function(test) {
    test.expect(3);

    var customData = {"ca_system":"OTT","user_token":KS,"account_id":"","content_id":"1_6ojmokuo_1_73eztmlo,1_6ojmokuo_1_00n1ga1a,1_6ojmokuo_1_pls78sme,1_6ojmokuo_1_xg79vol6","files":"","udid":""};
    var drmType = true;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);

    var ott = new OTT(customData, providerData);

    var entitlement = ott.getEntitlement();

    entitlement.then(
        function(result)
        {
            test.ok(result.duration == 0, WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == "00:00:00", WRONG_ABSOLUTE_DURATION_MESSAGE);
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
    var drmType = false;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);
    
    var mock = new MOCK(customData, providerData);

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
    var drmType = true;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);
    var mock = new MOCK(customData, providerData);

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


//this test the EntitlementFactory in for OVP
exports.testEntitlementFactoryOVP = function(test) {

    var customData = {"ca_system":"OVP","user_token":KS,"account_id":"","content_id":"1_6ojmokuo_1_73eztmlo,1_6ojmokuo_1_00n1ga1a,1_6ojmokuo_1_pls78sme,1_6ojmokuo_1_xg79vol6","files":"","udid":""};
    //var providerData = {"provider_sign_key":"wSeqVbdA31+nWm9OfBbseuIhi5LwJoRlpiwCyJz7HYg=","cas_password":"11111","key":"b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=","iv":"h3jAqQOGlps/swgz5b0Kww==","cas_username":"conditionalaccess_198","provider":"kaltura"};
    var drmType = false;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);

    var ent = EntitlementFactory.createEntitlement(customData, providerData);

    var entitlement = ent.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == "0", WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == "0", WRONG_ABSOLUTE_DURATION_MESSAGE);
            test.ok(result.policy == "", WRONG_POLICY_MESSAGE);
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};


//this test the EntitlementFactory in for OTT
exports.testEntitlementFactoryOTT = function(test) {

    var customData = {"ca_system":"OTT","user_token":KS,"account_id":"","content_id":"1_6ojmokuo_1_73eztmlo,1_6ojmokuo_1_00n1ga1a,1_6ojmokuo_1_pls78sme,1_6ojmokuo_1_xg79vol6","files":"","udid":""};
    //var providerData = {"provider_sign_key":"wSeqVbdA31+nWm9OfBbseuIhi5LwJoRlpiwCyJz7HYg=","cas_password":"11111","key":"b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=","iv":"h3jAqQOGlps/swgz5b0Kww==","cas_username":"conditionalaccess_198","provider":"kaltura"};
    var drmType = true;
    var accountId = null;
    var providerData = new KalturaProviderData(drmType, accountId);

    var ent = EntitlementFactory.createEntitlement(customData, providerData);

    var entitlement = ent.getEntitlement();
    entitlement.then(
        function(result)
        {
            test.ok(result.duration == 0, WRONG_DURATION_MESSAGE);
            test.ok(result.absolute_duration == "00:00:00", WRONG_ABSOLUTE_DURATION_MESSAGE);
            test.ok(result.policy == "", WRONG_POLICY_MESSAGE);
        },
        function(err)
        {
            test.ok(false, err);
        }
    );
    entitlement.finally(function(){test.done();});
};
