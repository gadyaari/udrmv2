
var util = require('util');
var cb = require('../utils/KalturaCouchbaseConnector');
var qs = require('querystring'); 

var kaltura = module.exports = require('../KalturaBase');


var KalturaAdminManager = function() {};
util.inherits(KalturaAdminManager, kaltura.KalturaBase);
KalturaAdminManager.prototype.start = function() {
    this.run = true;
};
KalturaAdminManager.prototype.stop = function()
{
    this.run = false;
};

KalturaAdminManager.prototype.addPartner = function(request, response, params, postData)
{
    var postParams = qs.parse(postData);
    KalturaLogger.log("@@NA doing add action action ["+util.inspect(postParams)+"]");
    if (!this.validate(params, postParams))
    {
        this.errorResponse(response, 403, "Request could not be validated");
        return;
    }
    
    var partnerKey = postParams.drmType + "_" + postParams.partnerId;
    var partnerDoc =  {"provider_sign_key":postParams.providerSignKey,
                       "iv":postParams.iv,
                       "key":postParams.key};
    if ( (typeof postParams.seed) != 'undefined')
    {
        partnerDoc.seed = postParams.seed;   
    }
    var partnerDocUpserted = function(err, result)
    {
        var responseObj = {'status':'OK'};
        this.okResponse(response, JSON.stringify(responseObj), 'application/json');
    };
    
    cb.KalturaCouchbaseConnector.upsert(partnerKey, partnerDoc, partnerDocUpserted);
    
};

KalturaAdminManager.prototype.validate = function(request)
{
    KalturaLogger.log("Admin request validated");
    return true;
};

module.exports.KalturaAdminManager = KalturaAdminManager;