const kalturaCouchbaseConnector = require('./utils/KalturaCouchbaseConnector');
require('../lib/utils/KalturaConfig');
var Promise = require("bluebird");

class KalturaProviderData
{
    constructor(drmType, accountId)
    {
        this.ott = drmType;
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
        //for now, get data from udrm.ini
        ottMockResponse = KalturaConfig.config.getPartnerDataOttMockResponse;
        ovpMockResponse = KalturaConfig.config.getPartnerDataOvpMockResponse;

        var ott = this.ott;
        return new Promise(function(resolve,reject)
        {
            if (ott)
                resolve(ottMockResponse);
            else
                resolve(ovpMockResponse);
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
        //for now, get data from udrm.ini
        ottMockResponse = KalturaConfig.config.getCasDataOttMockResponse;
        ovpMockResponse = KalturaConfig.config.getCasDataOvpMockResponse;

        var ott = this.ott;
        return new Promise(function(resolve,reject)
        {
            if (ott)
                resolve(ottMockResponse);
            else
                resolve(ovpMockResponse);
        });
    }
}

module.exports = KalturaProviderData;
