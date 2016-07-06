const Promise = require('bluebird');

const kalturaCouchbaseConnector = require('./utils/KalturaCouchbaseConnector');
require('../lib/utils/KalturaConfig');


class KalturaProviderData
{
    constructor(drmType, accountId)
    {
        this._drmType = drmType;
        this._accountId = accountId;
    }

    getPartnerData()
    {
        const providerKey = `${this._drmType}_${this._accountId}`;
        return kalturaCouchbaseConnector.getInstance().get(providerKey, true);
    }

    getCasData() {
        // just template to response from KalturaCouchbaseConnector
        var ottMockResponse = {
            "method_name": "XXXXXXXXX",
            "url": "XXXXXXXXX",
            "path" : "XXXXXXXXX"};
        var ovpMockResponse = {
            "url": "XXXXXXXXX",
            "timeout": 0, //int
            "ip_address_salt": "XXXXXXXXX",
            "additional_headers": {
                "X-KALTURA-F5-HTTPS": "XXXXXXXXX",
                "bla-header": "XXXXXXXXX"}};


        var ott = this.ott;
        return new Promise(function(resolve,reject)
        {
            //this should be taken from KalturaCouchbaseConnector
            //for now, get data from udrm.ini
            if (ott)
            {
                ottMockResponse = KalturaConfig.config.getCasDataOttMockResponse;
                resolve(ottMockResponse);
            }
            else
            {
                ovpMockResponse = KalturaConfig.config.getCasDataOvpMockResponse;
                resolve(ovpMockResponse);
            }

        });
    }
}

module.exports.KalturaProviderData = KalturaProviderData;
