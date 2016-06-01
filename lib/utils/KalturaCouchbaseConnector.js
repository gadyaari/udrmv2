var logger = require('../KalturaBase');
var util = require('util');

var mock = false;
if (mock)
{
    var couchbase = require('couchbase').Mock;
}
else {
    var couchbase = require('couchbase');
}

var KalturaCouchbaseConnector = {
    //clusterName : "ubuntudrm:8091",
    clusterName : "qa-cb01.dev.kaltura.com",
    bucketName : "uDRM",
    cluster : null,
    bucket : null,
    
    init : function() {
        this.cluster = new couchbase.Cluster(this.clusterName);//TODO: take this parameter from config
        this.bucket = this.cluster.openBucket(this.bucketName);//TODO: take this parameter from config
    },
    
    get : function(key, callback)
    {
        this.bucket.get(key, function (err, result)
        {
            if (err)
            {
                KalturaLogger.log("Error in getting key [" + key + "] msg ["+JSON.stringify(err)+"]");
            }
            else {
                KalturaLogger.log("Got result [" + util.inspect(result) + "]");
            }
            callback(err, result);
        });
    },
    
    upsert : function(key, value, callback)
    {
        this.bucket.upsert(key, value, function (err, result)
        {
            if (err)
            {
                KalturaLogger.log("Error in upsert msg ["+JSON.stringify(err)+"]");
                return;
            }
            KalturaLogger.log("Got result ["+util.inspect(result)+"]");
            callback(err, result);
            return;
        });
    }
    
};

module.exports.KalturaCouchbaseConnector = KalturaCouchbaseConnector;