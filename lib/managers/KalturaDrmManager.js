let util = require('util');
let qs = require('querystring');
let crypto = require('crypto');
let Promise = require('bluebird');
let kalturaBase = require('../KalturaBase');
let genericEntitlement = require('../entitlement/GenericEntitlement');

let kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');

class KalturaDrmManager extends kalturaBase.KalturaBase
{
    constructor(drmType)
    {
        super();
        this._drmType = drmType;
    }
    
    encryption(request, response)
    {
        let This = this;

        KalturaLogger.newLog("doing encryption action %s",util.inspect(request.body));
        let providerKey = this._drmType + "_" +  request.body.account_id;

        let validateRequest = function(providerData)
        {
            if (!This.validate(request.rawBody, request.query.signature, providerData) && !request.body.trust)
            {
                This.errorResponse(response, 403, "Request could not be validated");
                return;
            }
            else
            {
                KalturaLogger.newLog("Validation success what now");
                let encryptionDataPromise = This.createEncryptionData(providerData.value, request.body);
                encryptionDataPromise.then(
                    function(encryptionData)
                    {
                        This.okResponse(response, JSON.stringify(encryptionData),'application/json');
                    },
                    function(err)
                    {
                        This.errorResponse(response, 500, JSON.stringify(err));
                    }
                )
            }
        };

        let providerDataPromise = kalturaCouchbaseConnector.getInstance().get(providerKey, true);
        providerDataPromise.then(validateRequest,
            function(error)
            {
                This.errorResponse(response, 405, "Could not get provider data");
            }
        );
    }

    createEncryptionData(providerData)
    {
        return {"status":"unimplemented"};
    }

    outsideencryption(request, response)
    {
        request.body.account_id = request.params.partnerId;
        request.body.content_id = request.params.entryId;
        request.body.files = request.params.flavorId;
        request.body.trust = true;
        this.encryption(request, response);
    }
    
    validate(customDataStr, signature, providerData)
    {
        return true;
        if ( (typeof signature == 'undefined') || signature == "")
        {
            return false;
        }
        let msg = providerData.value.provider_sign_key + customDataStr;
        let sha1 = crypto.createHash('sha1');
        sha1.update(msg);
        let hashMsg = sha1.digest('base64');
        if (signature == hashMsg)
        {
            KalturaLogger.newLog("request validated");
            return true;
        }
        else
        {
            KalturaLogger.newLog("request validation failed, expected [%s] got [%s]", hashMsg, signature);
            return false;
        }
    }

    license(request, response)
    {
        let This = this;

         if ( (typeof request.query.custom_data == 'undefined') || request.query.custom_data == "")
        {
            this.errorResponse("400","No custom data given");
        }
        KalturaLogger.newLog("doing license action %s",util.inspect(request.body));
        let customDataStr = Buffer.from(request.query.custom_data, 'base64').toString();
        let customData = JSON.parse(customDataStr);
        let providerKey = this._drmType + "_" +  customData.account_id;
        let providerDataPromise = kalturaCouchbaseConnector.getInstance().get(providerKey, true);

        let validateRequest = function(providerData)
        {
            if (!This.validate(customDataStr, request.query.signature, providerData))
            {
                This.errorResponse(response, 403, "Request could not be validated");
                return;
            }
            else
            {
                KalturaLogger.newLog("Validation success what now");
                let entReq = new genericEntitlement(customData, providerData);
                //let entResponse = genericEntitlement.getEntitlement();

                //TODO only for testing, should be removed.
                let entResponse = {
                    policy: null,
                    duration: 3600,
                    absolute_duration: 123132131
                };

                let licenseResponsePromise = This.getLicenseResponse(providerData.value, customData, request.rawBody, entResponse,request.query.files);
                licenseResponsePromise.then(
                    function(licenseResponse)
                    {
                        This.okResponse(response, licenseResponse,'application/json');
                    },
                    function(err)
                    {
                        This.errorResponse(response, 500, JSON.stringify(err));
                    }
                )
            }
        };
        
        
        providerDataPromise.then(validateRequest,
            function(error)
            {
                This.errorResponse(response, 405, "Could not get provider data");
            }
        );
    }

    getLicenseResponse(providerData, customData, payload, entResponse, files)
    {
        return {"status":"unimplemented"};
    }
    
}

module.exports.KalturaDrmManager = KalturaDrmManager;