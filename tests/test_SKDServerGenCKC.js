/**
 * This is set of test for Native fairPlay: function SKDServerGenCKC
 * Created by David.Winder on 6/29/2016.
 */

require('util');

require('../lib/utils/KalturaConfig');
var LicenseProvider = require('../lib/entitlement/LicenseProvider');

var WRONG_STATUS_MESSAGE = "wrong duration!";
var WRONG_LICENSE_MESSAGE = "wrong absolute_duration!";

//var KS = KalturaConfig.config.udrm.KS;

//this test is just to see that the file is running and OK
exports.testExample = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

// this test create OVPEntitlement and send requet for OVP server
// answer is {0,0,None} because there is no such entryID
exports.testSimpleProvideLicense = function(test) {
    test.expect(2);
    var licenseProvider = new LicenseProvider();
    var license = licenseProvider.get_response();

    license.then(
        function(result)
        {
            test.ok(result.status == "OK", WRONG_STATUS_MESSAGE);
            test.ok(result.license == 12345, WRONG_LICENSE_MESSAGE);
        },
        function(err)
        {
            console.log("catch here! at the end");
            test.ok(false, err);
        }
    );
    license.finally(function(){test.done();});
};


