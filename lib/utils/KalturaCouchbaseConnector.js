var util = require('util');

var base = require('../KalturaBase');

var mock = false;
if (mock)
{
    var couchbase = require('couchbase').Mock;
}
else {
    var couchbase = require('couchbase');
}

KalturaCouchbaseConnector = {
    //clusterName : "ubuntudrm:8091",
    clusterName : "qa-cb01.dev.kaltura.com",
    bucketName : "uDRM",
    cluster : null,
    bucket : null,
    
    init : function() {
        this.cluster = new couchbase.Cluster(this.clusterName);//TODO: take this parameter from config
        this.bucket = this.cluster.openBucket(this.bucketName);//TODO: take this parameter from config
    },
    
    get : function(key, is_encrypted, callback)
    {
        this.bucket.get(key, function (err, result)
        {
            if (err)
            {
                KalturaLogger.log("Error in getting key [" + key + "] msg ["+JSON.stringify(err)+"]");
            }
            else {
                if (is_encrypted)
                {
                    encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
                    iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
                    Object.keys(result.value).forEach(function(key) {
                        var val = result.value[key];
                        result.value[key] = base.KalturaBase.prototype.decrypt(val, encKey, iv);
                    });
                    
                }
                KalturaLogger.log("Got result [" + util.inspect(result) + "]");
            }

            callback(err, result);
        });
    },
    
    upsert : function(key, value, encrypt, callback)
    {

        if (encrypt) {
            encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
            iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
            Object.keys(value).forEach(function (key) {
                var val = value[key];
                value[key] = base.KalturaBase.prototype.encrypt(val, encKey, iv);
            });

        }
        
        this.bucket.upsert(key, value, function (err, result)
        {
            if (err)
            {
                KalturaLogger.log("Error in upsert msg ["+JSON.stringify(err)+"]");
                return;
            }
            else {
                KalturaLogger.log("Got result [" + util.inspect(result) + "]");
            }
            callback(err, result);
            return;
        });
    }
};

