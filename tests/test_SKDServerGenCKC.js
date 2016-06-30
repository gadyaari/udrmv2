/**
 * This is set of test for Native fairPlay: function SKDServerGenCKC
 * Created by David.Winder on 6/29/2016.
 */

require('util');

require('../lib/utils/KalturaConfig');
var LicenseProvider = require('../lib/entitlement/LicenseProvider');

var WRONG_STATUS_MESSAGE = "wrong duration!";
var WRONG_LICENSE_MESSAGE = "wrong absolute_duration!";
var WRONG_CKC_MESSAGE = "wrong CKC!";

//var KS = KalturaConfig.config.udrm.KS;

//this test is just to see that the file is running and OK
exports.testExample = function(test) {
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

// this test create licenseProvider and retrive CKC for fairplay
exports.testSimpleProvideLicense = function(test) {
    test.expect(2);
    var licenseProvider = new LicenseProvider(LicenseProvider.getMockData());
    var duration = 123456;
    var license = licenseProvider.getResponse(duration);

    license.then(
        function(result)
        {
            test.ok(result.status == "OK", WRONG_STATUS_MESSAGE);
            test.ok(result.duration == duration, WRONG_LICENSE_MESSAGE);
            //test.ok(result.license == @Buffer@, WRONG_CKC_MESSAGE);
        },
        function(err)
        {
            console.log("catch here! at the end of tests");
            test.ok(false, err);
        }
    );
    license.finally(function(){test.done();});
};


