var util = require('util');
var http = require("http");
var Promise = require("bluebird");


var genericEntitlement = require('./GenericEntitlement');
var entitlementResponse = require('./EntitlementResponse');



function OVPEntitlement(server, customData , can_skip) {
    genericEntitlement.call(this,server, customData , can_skip);
};

module.exports = OVPEntitlement;
util.inherits(OVPEntitlement, genericEntitlement);

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






