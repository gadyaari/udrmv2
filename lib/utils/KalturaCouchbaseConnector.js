let util = require('util');
let Promise = require("bluebird");

let base = require('../KalturaBase');

let mock = false;
let couchbase = require('couchbase'); 
if (mock)
{
    couchbase = couchbase.Mock;
}

class KalturaCouchbaseConnector {
    constructor(){
        this._clusterName = "ubuntudrm.local:8091";
        this._bucketName = "uDRM";
        this._cluster = new couchbase.Cluster(this._clusterName);//TODO: take this parameter from config
        this._bucket = this._cluster.openBucket(this._bucketName);//TODO: take this parameter from config
    }

    static getInstance()
    {
        if (typeof KalturaCouchbaseConnector.instance == 'undefined')
        {
            KalturaCouchbaseConnector.instance = new KalturaCouchbaseConnector();
        }
        return KalturaCouchbaseConnector.instance;
    }
    
    get(key, is_encrypted)
    {
        let This = this;
        return new Promise(function(resolve,reject) {
            This._bucket.get(key, function (err, result) {
                if (err) {
                    KalturaLogger.log("Error in getting key [" + key + "] msg [" + JSON.stringify(err) + "]");
                    reject(err);
                }
                else {
                    if (is_encrypted) {
                        let encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
                        let iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
                        Object.keys(result.value).forEach(function (key) {
                            let val = result.value[key];
                            result.value[key] = base.KalturaBase.prototype.decrypt(val, encKey, iv);
                        });
    
                    }
                    KalturaLogger.log("Got result [" + util.inspect(result) + "]");
                }
                resolve(result);
            })
        });
    }

    upsert(key, value, encrypt)
    {
        let This = this;
        if (encrypt) {
            let encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
            let iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
            Object.keys(value).forEach(function (key) {
                let val = value[key];
                value[key] = base.KalturaBase.prototype.encrypt(val, encKey, iv);
            });
    
        }
    
        return new Promise(function(resolve, reject) {
    
            This._bucket.upsert(key, value, function (err, result) {
                if (err) {
                    KalturaLogger.log("Error in upsert msg [" + JSON.stringify(err) + "]");
                    reject(err);
                }
                else {
                    KalturaLogger.log("Got result [" + util.inspect(result) + "]");
                }
                resolve(result);
            });
        });
    }
}

module.exports = KalturaCouchbaseConnector;