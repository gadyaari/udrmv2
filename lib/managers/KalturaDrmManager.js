var util = require('util');
var qs = require('querystring');
var crypto = require('crypto');

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
    var postParams = qs.parse(postData);
    KalturaLogger.newLog("doing encryption action %s",util.inspect(postParams));
    var customDataStr = Buffer(postParams.custom_data, 'base64').toString('ascii');
    var customData = JSON.parse(customDataStr);
    var providerKey = this.drmType + "_" +  customData.account_id;

    var validationSuccess = function(err, result)
    {
        if (!This.validate(customDataStr, postParams.signature, result))
        {
            This.errorResponse(response, 403, "Request could not be validated");
            return;
        }
        else
        {
            KalturaLogger.newLog("Validation success what now");
            This.okResponse(response, "The validation is a success",'text/html');
        }
    };
    
    KalturaCouchbaseConnector.get(providerKey, validationSuccess);
    
};

KalturaDrmManager.prototype.validate = function(customDataStr, signature, providerData)
{
    if ( (typeof signature == 'undefined') || signature == "")
    {
        return false;
    }
    var msg = providerData.provider_sign_key + customDataStr;
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