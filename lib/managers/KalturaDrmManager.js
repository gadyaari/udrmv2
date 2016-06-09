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
    var postParams = "";
    if (request.headers["content-type"] == 'application/json')
    {
        postParams = JSON.parse(postData);
    }
    else {
        postParams = qs.parse(postData);
    }
    KalturaLogger.newLog("doing encryption action %s",util.inspect(postParams));
    var providerKey = this.drmType + "_" +  postParams.account_id;

    var validationSuccess = function(err, result)
    {
        if (!This.validate(postData, params.signature, result))
        {
            This.errorResponse(response, 403, "Request could not be validated");
            return;
        }
        else
        {

        }
    };
    var providerData = KalturaCouchbaseConnector.get(providerKey, true);
    return providerData.then(
        function(result)
        {
            encryptionData = This.createEncryptionData(result.value, postParams);
            encryptionData.then(
                function(result){
                    This.okResponse(response, JSON.stringify(result),'application/json');                    
                },
                function(err)
                {
                    This.errorResponse(response, 403, JSON.stringify(error));
                }
            );
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