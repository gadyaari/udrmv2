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
        // just template to response from KalturaCouchbaseConnector
        var ottMockResponse = {
            "cas_username":"XXXXXXXXX",
            "cas_password":"XXXXXXXXX",
            'provider_sign_key': 'XXXXXXXXX=',
            'iv': 'XXXXXXXXX',
            'key': 'XXXXXXXXX',
            'provider': 'XXXXXXXXX'};
        var ovpMockResponse = {
            'provider_sign_key': 'XXXXXXXXX=',
            'iv': 'XXXXXXXXX',
            'key': 'XXXXXXXXX',
            'provider': 'XXXXXXXXX'};


        var ott = this.ott;
        return new Promise(function(resolve,reject)
        {
            //this should be taken from KalturaCouchbaseConnector
            //for now, get data from udrm.ini
            if (ott) {
                ottMockResponse = KalturaConfig.config.getPartnerDataOttMockResponse;
                resolve(ottMockResponse);
            }
            else
            {
                ovpMockResponse = KalturaConfig.config.getPartnerDataOvpMockResponse;
                resolve(ovpMockResponse);
            }

        });
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
