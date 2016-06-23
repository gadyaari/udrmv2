const Promise = require('bluebird');

const kalturaCouchbaseConnector = require('./utils/KalturaCouchbaseConnector');

class KalturaProviderData
{
    constructor(drmType, accountId)
    {
        this._drmType = drmType;
        this._accountId = accountId;
    }
        
    getProviderData()
    {
        let This = this;
        if (typeof this._providerData != 'undefined')
            return this._providerData;
        else 
        {
            let providerKey = this._drmType + "_" +  this._accountId;
            let cbPromise = kalturaCouchbaseConnector.getInstance().get(providerKey, true);
            function cbReturn(result)
            {
                This._providerData = result.value;
            };
            function errorFromCB(error)
            {
                
            };
            cbPromise.then(cbReturn, errorFromCB);
            return Promise.resolve(cbPromise);
        }
    }
    
    getCasData() {
        if (this.ott)
            return {
                "method_name": "GetItemLeftViewLifeCycle",
                "url": "http://ws-external-219102433.eu-west-1.elb.amazonaws.com",
                "path" : "/CAS_V3_5/module.asmx/GetItemLeftViewLifeCycle"
            };
        else
            return {
                "url": "centos.kaltura",
                "timeout": 60,
                "ip_address_salt": "1234",
                "additional_headers": {
                    "X-KALTURA-F5-HTTPS": "ON",
                    "bla-header": "bla-value-for-header"
                }
            };
        

    }
}

module.exports = KalturaProviderData;
