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
        this._clusterName = KalturaConfig.config.udrm.COUCHBASE_CLUSTER;
        this._bucketName = KalturaConfig.config.udrm.COUCHBASE_BUCKET;
        this._cluster = new couchbase.Cluster(this._clusterName);
        //TODO: take this parameter from config
        this._bucket = this._cluster.openBucket(this._bucketName);
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
                        result.value = This._decryptValues(result.value, encKey, iv);
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
        const valueCopy = JSON.parse(JSON.stringify(value));
        if (encrypt) {
            let encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
            let iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
            This._encryptValues(valueCopy, encKey, iv);
        }

        return new Promise(function(resolve, reject) {

            This._bucket.upsert(key, valueCopy, function (err, result) {
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

    getMulti(keys, is_encrypted)
    {
        let This = this;
        return new Promise(function(resolve,reject) {
            This._bucket.getMulti(keys, function (err, results) {
                if (err && err!="1") {
                    KalturaLogger.log("Error in getting keys [" + JSON.stringify(keys) + "] msg [" + util.inspect(err) + "] result ["+util.inspect(results)+"]");
                    reject(err);
                    return;
                }
                else {
                    if (is_encrypted) {
                        let encKey = Buffer(KalturaConfig.config.udrm.KEY, 'base64');
                        let iv = Buffer(KalturaConfig.config.udrm.IV, 'base64');
                        for(let entryKey in results)
                            results[entryKey].value = This._decryptValues(results[entryKey].value, encKey, iv);
                    }
                    KalturaLogger.log("Got result [" + util.inspect(results) + "]");
                }
                resolve(results);
            })
        });
    }

    _decryptValues(object, encKey, iv)
    {
        let This = this;
        if (typeof object == 'string')
            return base.KalturaBase.prototype.decrypt(object, encKey, iv);
        else
        {
            for (let key in object) {
                var val = object[key];
                object[key] = This._decryptValues(val, encKey, iv);
            }
        }
        return object;
    }

    _encryptValues(object, encKey, iv)
    {
        let This = this;
        if (typeof object == 'string')
            return base.KalturaBase.prototype.encrypt(object, encKey, {iv:iv});
        else
        {
            for (let key in object) {
                var val = object[key];
                object[key] = This._encryptValues(val, encKey, iv);
            }
        }
        return object;
    }
}

module.exports = KalturaCouchbaseConnector;