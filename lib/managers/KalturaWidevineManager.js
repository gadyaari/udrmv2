var os = require('os');
var util = require('util');
var fs = require('fs');

var drmManager = require('./KalturaDrmManager');
var kaltura = module.exports = require('../KalturaBase');

var KalturaWidevineManager = function(){
    KalturaWidevineManager.super_.apply(this, ['widevine']);
    //KalturaWidevineManager.super('widevine');
};

KalturaWidevineManager.prototype.start = function(){
    this.run = true;
};

KalturaWidevineManager.prototype.stop = function(){
    this.run = false;
};


KalturaWidevineManager.prototype.encryption = function(request, response, params, postData)
{
    KalturaLogger.newLog("testing new log %s","param1","param2",10);
    KalturaLogger.error("@@NA5 doing test action");
    this.okResponse(response, 'OK', 'text/plain');
};

util.inherits(KalturaWidevineManager, drmManager.KalturaDrmManager);

module.exports.KalturaWidevineManager = KalturaWidevineManager;