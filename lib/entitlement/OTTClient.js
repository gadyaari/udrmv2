/**
 * This class is client for OTT
 * Created by David.Winder on 7/15/2016.
 */
var util = require('util');
var Promise = require("bluebird");
var parseString = require('xml2js').parseString;

var entitlementResponse = require('./EntitlementResponse');


class OTTClient
{
    constructor(url, path)
    {
        KalturaLogger.log("Initializing OTT client");
        this._server = url;
        this._path = path;
    }


    static extracProtocol(url) {
        var protocol;
        var serverIp;
        if (url.startsWith("https"))
        {
            protocol = require("https");
            serverIp = url.substring(8); //remove the https:// prefix as 8 = ("https://").length
        }
        else
        {
            protocol = require("http");
            serverIp = url.substring(7); //remove the http:// prefix as 8 = ("http://").length
        }
        return {"protocol":protocol, "url":serverIp};
    }



    getDRMAccess(sWSUserName,sWSPassword, sMediaFileID, sSiteGUID, bIsCoGuid, sCOUNTRY_CODE, sLANGUAGE_CODE, sDEVICE_NAME)
    {
        var body = "sWSUserName=" + sWSUserName + "&sWSPassword=" + sWSPassword
                + "&sMediaFileID=" + sMediaFileID + "&sSiteGUID=" + sSiteGUID
                + "&bIsCoGuid=" + bIsCoGuid + "&sCOUNTRY_CODE=" + sCOUNTRY_CODE
                + "&sLANGUAGE_CODE=" + sLANGUAGE_CODE + "&sDEVICE_NAME=" + sDEVICE_NAME;


        var communicationData = OTTClient.extracProtocol(this._server);
        var protocol = communicationData.protocol;
        var url = communicationData.url;
        var path = this._path;

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
                if (protocol.STATUS_CODES[res.statusCode] != "OK")
                    reject("statusCode was:" + protocol.STATUS_CODES[res.statusCode]);
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
                KalturaLogger.log("ERROR: " + e.message);
                reject("Error in HTTP: "+ e.message);
            });

            // write data to request body
            req.write(body);
            req.end();

        });
    }
}



module.exports = OTTClient;

