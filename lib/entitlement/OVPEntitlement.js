var util = require('util');
var http = require("http");
var Promise = require("bluebird");


var genericEntitlement = require('./GenericEntitlement');
var entitlementResponse = require('./EntitlementResponse');

module.exports = OVPEntitlement;
util.inherits(OVPEntitlement, genericEntitlement);

function OVPEntitlement(server, customData , can_skip) {

    var valid = function(server, customData) {
        if (customData.ca_system != "OVP") return false;
        return true;
    }

    if (!valid(server, customData))
        KalturaLogger.error("non-valid parameters", null);
    //call super.constructor
    genericEntitlement.call(this,server, customData , can_skip);
    
    this.ks = customData.user_token;
    this.systemType = customData.ca_system; // as OVP
};

OVPEntitlement.prototype.getEntitlement = function()
{
    KalturaLogger.log("sending request for entitlement (to OVP)...");
    // enter all parameter of the http request
    var params = {};
    params["entryId"] = this.content_id;
    params["flavorIds"] = this.flavorIds;
    params["ks"] = this.ks;
    params["referrer"] = "";
    params["format"] = 1; // as json
    var service = "drm_drmlicenseaccess";
    var action = "getaccess";

    // building url request
    var url = "http://" + this.server + "/api_v3/index.php?";
    url += "service=" + service + "&action=" + action;
    for (var key in params) {
        url += "&" + key + "=" + params[key];
    }

    return new Promise(function(resolve,reject) {
        http.get(url, function(response){
            var data = "";
            response.on("data", function(chunk) {
                data += chunk;
            });
            response.on("end", function() {
                try {
                    var parse = JSON.parse(data);
                } catch (err) {
                    reject(err);
                }
                if (parse.objectType == "KalturaAPIException") {
                    reject("KalturaAPIException " + parse.message);
                } else {
                    entitlementResponse.duration = parse.duration;
                    entitlementResponse.absolute_duration = parse.absolute_duration;
                    entitlementResponse.policy = parse.policy;
                    KalturaLogger.log("duration is: " + parse.duration +" and absolute_duration is: " + parse.absolute_duration + " and policy is: " + parse.policy);
                    resolve(entitlementResponse);
                }
            });
        }).on('error', function(e){
            reject(e.message);
        });

    });
    
};






