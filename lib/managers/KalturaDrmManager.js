var util = require('util');
var qs = require('querystring');
var crypto = require('crypto');
var Promise = require('bluebird');

require('../utils/KalturaCouchbaseConnector');

var kaltura = module.exports = require('../KalturaBase');


var KalturaDrmManager = function(drmType){
    this.drmType = drmType;
};
util.inherits(KalturaDrmManager, kaltura.KalturaBase);

KalturaDrmManager.prototype.start = function(){
    this.run = true;
};

KalturaDrmManager.prototype.stop = function(){
    this.run = false;
};


KalturaDrmManager.prototype.encryption = function(request, response, params, postData)
{
    var This = this;
    
    KalturaLogger.newLog("doing encryption action %s",util.inspect(request.body));
    var providerKey = this.drmType + "_" +  request.body.account_id;

    var validateRequest = function(providerData)
    {
        if (!This.validate(request.rawBody, request.query.signature, providerData))
        {
            This.errorResponse(response, 403, "Request could not be validated");
            return;
        }
        else
        {
            KalturaLogger.newLog("Validation success what now");
            encryptionDataPromise = This.createEncryptionData(providerData.value, request.body);
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
       
    var providerDataPromise = KalturaCouchbaseConnector.getInstance().get(providerKey, true);
    providerDataPromise.then(validateRequest,
        function(error)
        {
            This.errorResponse(response, 405, "Could not get provider data");      
        }
    );
    
};

KalturaDrmManager.prototype.createEncryptionData = function(providerData)
{
    return {"status":"unimplemented"};
}

KalturaDrmManager.prototype.validate = function(customDataStr, signature, providerData)
{
    if ( (typeof signature == 'undefined') || signature == "")
    {
        return false;
    }
    var msg = providerData.value.provider_sign_key + customDataStr;
    var sha1 = crypto.createHash('sha1');
    sha1.update(msg);
    var hashMsg = sha1.digest('base64');
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
};

module.exports.KalturaDrmManager = KalturaDrmManager;