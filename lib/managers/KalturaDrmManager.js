const util = require('util');
const qs = require('querystring');
const crypto = require('crypto');
const Promise = require('bluebird');

const kalturaBase = require('../KalturaBase');
const genericEntitlement = require('../entitlement/GenericEntitlement');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const entitlementFactory = require('../entitlement/EntitlementFactory');
const kalturaProviderData = require('../KalturaProviderData');

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
        let providerData =  new kalturaProviderData(this._drmType, customData.account_id);
        let providerDataPromise = providerData.getProviderData();

        let validateRequest = function(innerProviderData)
        {
            if (!This.validate(customDataStr, request.query.signature, innerProviderData))
            {
                This.errorResponse(response, 403, "Request could not be validated");
                return;
            }
            else
            {
                KalturaLogger.newLog("Validation success what now");
                let entReq = entitlementFactory.createEntitlement(customData, providerData);
                let entResponsePromise = entReq.getEntitlement();
                function getLicenseWithEntitlement(entResponse)
                {
                    //TODO only for testing, should be removed.
                    //let entResponse = {
                    //    policy: null,
                    //    duration: 3600,
                    //    absolute_duration: 123132131
                    //};

                    let licenseResponsePromise = This.getLicenseResponse(innerProviderData.value, customData, request.rawBody, entResponse,request.query.files);
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
                };
                function errorGettingEntitlement(error)
                {
                    KalturaLogger.log('error gettting entitlment ['+util.inspect(error)+']');
                    This.errorResponse(response, 403, 'error while getting entitlement');
                };
                entResponsePromise.then(getLicenseWithEntitlement, errorGettingEntitlement);
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