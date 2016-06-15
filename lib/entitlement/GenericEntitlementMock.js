/**
 * This node is for mock - inner test only
 * Created by David.Winder on 6/14/2016.
 */
var util = require('util');
var Promise = require("bluebird");

var entitlementResponse = require('./EntitlementResponse');

var DEFAULT_POLICY = "None";
var DEFAULT_DURATION_OVP = "15000";
var DEFAULT_ABSOLUTE_DURATION_OVP = "15000";
var DEFAULT_DURATION_OTT = "4.06:08:18.8530000";
var DEFAULT_ABSOLUTE_DURATION_OTT = "4.06:08:18.8530000";


var GenericEntitlementMock = function(server, customData , can_skip)
{
    // actually does nothing except extract the systemType for entitlementResponse
    // all the rest can be take from GenericEntitlement if necessary
    this.systemType = customData.ca_system;
};



GenericEntitlementMock.prototype.getEntitlement = function()
{
    var type = this.systemType;
    KalturaLogger.log("generating mockEntitlement for " + type);

    return new Promise(function(resolve,reject) {
        entitlementResponse.policy = DEFAULT_POLICY;

        switch (type) {
            case "OVP":
                entitlementResponse.duration = DEFAULT_DURATION_OVP;
                entitlementResponse.absolute_duration = DEFAULT_ABSOLUTE_DURATION_OVP;
                break;
            case "OTT":
                entitlementResponse.duration = DEFAULT_DURATION_OTT;
                entitlementResponse.absolute_duration = DEFAULT_ABSOLUTE_DURATION_OTT;
                break;
            default:
                break;
        }
        if (true)
            resolve(entitlementResponse);
        else reject("error");
    });
};



module.exports = GenericEntitlementMock;
