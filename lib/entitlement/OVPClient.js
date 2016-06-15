/**
 * This class is client for OVP
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');
var http = require("http");
var Promise = require("bluebird");


var kalturaClient = require('../client/KalturaClient');
var entitlementResponse = require('./EntitlementResponse');


class OVPClient
{
    constructor(url, ks)
    {
        KalturaLogger.log("Initializing OVP client");
        var clientConfig = new kalturaClient.KalturaConfiguration();
        clientConfig.serviceUrl = 'http://' + url;
        clientConfig.setLogger(KalturaLogger);
        this._client = new kalturaClient.KalturaClient(clientConfig);
        this._client.setKs(ks);
    }


    getDRMaccess(entryID,flavorIds, files)
    {
        var client = this._client;
        return new Promise(function(resolve,reject)
        {
            function callback(results, err)
            {
                if (err) 
                {
                    reject(err);
                } 
                else
                {
                    if (results.objectType == "KalturaAPIException")
                    {
                        reject("KalturaAPIException " + results.message);
                    }
                    else 
                    {
                        entitlementResponse.duration = results.duration;
                        entitlementResponse.absolute_duration = results.absolute_duration;
                        entitlementResponse.policy = results.policy;
                        resolve(entitlementResponse);
                    }
                }
            }
            client.drmLicenseAccess.getAccess(callback, entryID, flavorIds, files);
        });
    }
}



module.exports = OVPClient;

