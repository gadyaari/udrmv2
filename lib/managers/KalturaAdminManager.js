var os = require('os');
var util = require('util');
var fs = require('fs');
var couchbase = require('../utils/KalturaCouchbaseConnector');

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

KalturaAdminManager.prototype.addPartner = function(request, response, params)
{
    KalturaLogger.error("@@NA doing add action action ["+util.inspect(request)+"]");
    if (!this.validate(request))
    {
        this.errorResponse(response, 403, "Request could not be validated");
        return;
    }
    var responseObj = {'status':'OK'};
    this.okResponse(response, JSON.stringify(responseObj), 'application/json');
};

KalturaAdminManager.prototype.validate = function(request)
{
    KalturaLogger.log("Admin request validated");
    return true;
};

module.exports.KalturaAdminManager = KalturaAdminManager;