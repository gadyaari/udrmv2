var os = require('os');
var util = require('util');
var fs = require('fs');

var kaltura = module.exports = require('../KalturaBase');


var KalturaTestManager = function(){
    
};
util.inherits(KalturaTestManager, kaltura.KalturaBase);

KalturaTestManager.prototype.start = function(){
    this.run = true;
};

KalturaTestManager.prototype.stop = function(){
    this.run = false;
};


KalturaTestManager.prototype.testAction = function(request, response, params)
{
    KalturaLogger.error("@@NA5 doing test action");
    this.okResponse(response, 'OK', 'text/plain');
};

module.exports.KalturaTestManager = KalturaTestManager;