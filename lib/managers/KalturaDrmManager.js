let util = require('util');
let qs = require('querystring');
let crypto = require('crypto');
let Promise = require('bluebird');
let kalturaBase = require('../KalturaBase');

let kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');

class KalturaDrmManager extends kalturaBase.KalturaBase
{
    constructor(drmType)
    {
        super();
        this._drmType = drmType;
    }

    encryption(request, response, params, postData)
    {
        let This = this;

        KalturaLogger.newLog("doing encryption action %s",util.inspect(request.body));
        let providerKey = this._drmType + "_" +  request.body.account_id;

        let validateRequest = function(providerData)
        {
            if (!This.validate(request.rawBody, request.query.signature, providerData))
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

    validate(customDataStr, signature, providerData)
    {
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
}

module.exports.KalturaDrmManager = KalturaDrmManager;