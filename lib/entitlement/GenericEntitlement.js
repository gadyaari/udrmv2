/**
 * This is basic Generic-Entitlement
 * act as class who communicate with CAS servers and retrieve entitlement
 * Created by David.Winder on 6/14/2016.
 */
var util = require('util');

var base = require('../KalturaBase');


var GenericEntitlement = function(server, customData , can_skip)
{
    this.server = server;
    // set default can_skip = false
    if (typeof can_skip === 'undefined')
        can_skip = false;
    //for hard-coded - if we want to skip
    this.can_skip = can_skip;

    this.content_id = customData.content_id;
    this.flavorIds = customData.files;   // in test in ""
    
    //this.provider_data = customData.provider_data; // for OTT only
    //this.systemType = OTT // in OTT file
};



GenericEntitlement.prototype.getEntitlement = function()
{
    KalturaLogger.log("in getEntitlement of GenericEntitlement");

    /*
    //get the entitlement from OVP using promise and http

    var params = {};
    params["entryId"] = this.content_id;
    params["flavorIds"] = this.flavorIds;
    params["ks"] = this.ks;
    params["referrer"] = "";
    params["format"] = 1; // as json

    var service = "drm_drmlicenseaccess";
    var action = "getaccess";

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
                var parse = JSON.parse(data);
                if (parse.objectType == "KalturaAPIException") {
                    reject(parse.message);
                } else {
                    EntitlementResponse.duration = parse.duration;
                    EntitlementResponse.absolute_duration = parse.absolute_duration;
                    EntitlementResponse.policy = parse.policy;
                    KalturaLogger.log("duration is: " + parse.duration +" and absolute_duration is: " + parse.absolute_duration + " and policy is: " + parse.policy);
                    resolve(EntitlementResponse);
                }
            });
        }).on('error', function(e){
            reject(e.message);
        });

    });
    */
    /*

    this is without the kaltura client lib - only http
    this is with call back



    function callback() {
        KalturaLogger.log("Got to callback");
    }


    var params = {};
    params["entryId"] = this.content_id;
    params["flavorIds"] = this.flavorIds;
    params["referrer"] = "";
    params["ks"] = this.ks;
    params["format"] = 1; // as json


    var url = "http://" + this.server + "/api_v3/index.php?";
    var service = "drm_drmlicenseaccess";
    var action = "getaccess";

    url += "service=" + service + "&action=" + action;
    for (var key in params) {
        url += "&" + key + "=" + params[key];
    }

    http.get(url, function(response){
        var data = "";
        response.on("data", function(chunk) {
            data += chunk;
        });
        response.on("end", function() {
            var headers = [];
            for(var header in response.headers){
                headers.push(header + ": " + response.headers[header]);
            }
            KalturaLogger.log("Headers: \n\t" + headers.join("\n\t"));
            KalturaLogger.log("Response: " + data);
            KalturaLogger.log("phase \n\n ");
            var parse = JSON.parse(data);


            if (parse.objectType == "KalturaAPIException") {
                KalturaLogger.log("Got KalturaAPIException");
                callback(); // but to error
            } else {
                KalturaLogger.log("duration is: " + parse.duration);
                KalturaLogger.log("absolute_duration is: " + parse.absolute_duration);
                KalturaLogger.log("policy is: " + parse.policy);
                callback(); // with 3 parameter
            }

        });
    }).on('error', function(e){
        KalturaLogger.log('Request failed  [' + requestIndex + ']: ' + e.message);
        callback(); // but to error
    });

*/
    /*
    this is with use of baseClient from Kaltura base client lib

     var client = null;

     function initClient (url, ks) {
     KalturaLogger.log("Initializing client");
     var clientConfig = new kaltura.client.KalturaConfiguration();
     clientConfig.serviceUrl = 'http://' + url;
     clientConfig.setLogger(KalturaLogger);
     var client = new kaltura.client.KalturaClient(clientConfig);
     client.setKs(ks);
     return client;
     }

     function callback() {
     KalturaLogger.log("Got to callback");
     }

    client = initClient(this.server, this.ks);
    client.addParam(kparams, "entryId", this.content_id);
    client.addParam(kparams, "partnerId", "102");
    client.addParam(kparams, "flavorIds", this.flavorIds);
    client.addParam(kparams, "referrer", "");

    client.queueServiceActionCall('drm_drmlicenseaccess', 'getaccess', kparams);
    if (!client.isMultiRequest()){
        client.doQueue(callback);
    }
    */
};



module.exports = GenericEntitlement;

