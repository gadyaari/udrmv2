/**
 * This class is client for OVP
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');
var http = require("http");
var Promise = require("bluebird");



var kalturaClient = require('../client/KalturaClient');
var entitlementResponse = require('./EntitlementResponse');

module.exports = OVPClient;
function OVPClient(url, ks) {
    KalturaLogger.log("Initializing OVP client");
    var clientConfig = new kalturaClient.KalturaConfiguration();
    clientConfig.serviceUrl = 'http://' + url;
    clientConfig.setLogger(KalturaLogger);
    this._client = new kalturaClient.KalturaClient(clientConfig);
    this._client.setKs(ks);


    this._ks = ks;
    this._server = url;
};



OVPClient.prototype.getDRMaccess = function(entryID,flavorIds, files)
{
    var client = this._client;
    return new Promise(function(resolve,reject) {
        function callback(results, err) {
            if (err) {
                reject(err);
            } else {
                if (results.objectType == "KalturaAPIException") {
                    reject("KalturaAPIException " + results.message);
                } else {
                    entitlementResponse.duration = results.duration;
                    entitlementResponse.absolute_duration = results.absolute_duration;
                    entitlementResponse.policy = results.policy;
                    KalturaLogger.log("got from OVPClient: duration is: " + results.duration +" and absolute_duration is: " + results.absolute_duration + " and policy is: " + results.policy);
                    resolve(entitlementResponse);
                }

                resolve(results);
            }
        }
        client.drmLicenseAccess.getAccess(callback, entryID, flavorIds, files);
    });






/*



     KalturaLogger.log("sending request for entitlement (to OVP) in getDRMaccess...");
     // enter all parameter of the http request
     var params = {};
     params["entryId"] = entryID;
     params["flavorIds"] = flavorIds;
     params["ks"] = this._ks;
     params["referrer"] = "";
     params["format"] = 1; // as json
     var service = "drm_drmlicenseaccess";
     var action = "getaccess";

     // building url request
     var url = "http://" + this._server + "/api_v3/index.php?";
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

*/

};
