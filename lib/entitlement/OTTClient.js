/**
 * This class is client for OTT
 * Created by David.Winder on 7/15/2016.
 */
var util = require('util');
var http = require("http");
var https = require("https");
var Promise = require("bluebird");
var parseString = require('xml2js').parseString;



var kalturaClient = require('../client/KalturaClient');
var entitlementResponse = require('./EntitlementResponse');


class OTTClient
{
    constructor(url, path)
    {
        KalturaLogger.log("Initializing OTT client");
        this._server = url;
        this._path = path;
    }



    getDRMaccess(sWSUserName,sWSPassword, sMediaFileID, sSiteGUID, bIsCoGuid, sCOUNTRY_CODE, sLANGUAGE_CODE, sDEVICE_NAME)
    {
        //build the http.post body with all parameters
        var body = "sWSUserName=" + sWSUserName + "&sWSPassword=" + sWSPassword;
        body += "&sMediaFileID=" + sMediaFileID + "&sSiteGUID=" + sSiteGUID;
        body += "&bIsCoGuid=" + bIsCoGuid + "&sCOUNTRY_CODE=" + sCOUNTRY_CODE;
        body += "&sLANGUAGE_CODE=" + sLANGUAGE_CODE + "&sDEVICE_NAME=" + sDEVICE_NAME;

        // choose protocol and cut the prefix of the server ip
        var url = this._server;
        var path = this._path;
        var protocol = http;
        if (url.startsWith("http://"))
        {
            url = url.substring(7);
        }
        else
        {
            url = url.substring(8);
            protocol = https;
        }


        return new Promise(function(resolve,reject)
        {
            var options = {
                hostname: url,
                path: path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': body.length
                }
            };
            KalturaLogger.log("Sending request to OTT server");
            var req = protocol.request(options, function(res) {
                var data = "";
                if (res.statusCode != 200)
                    reject("statusCode was not 200");
                KalturaLogger.log("STATUS: " + res.statusCode);
                res.setEncoding('utf8');

                res.on('data', function (chunk) {
                    data += chunk;
                });
                res.on('end', function() {
                    KalturaLogger.log("ANSWER: " + data);
                    parseString(data, function (err, result) {
                        // here need to extract entitlement
                        entitlementResponse.duration = "0";
                        entitlementResponse.absolute_duration = result.string._;
                        entitlementResponse.policy = "";
                        resolve(entitlementResponse);
                    });
                })
            });
            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });

            // write data to request body
            req.write(body);
            req.end();

        });
    }
}



module.exports = OTTClient;

