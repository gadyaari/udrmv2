const kalturaCouchbaseConnector = require('./utils/KalturaCouchbaseConnector');

class KalturaProviderData
{
    constructor(drmType, accountId)
    {
        this.ott = drmType;
    }
    
    getProviderData()
    {
        if (this.ott)
            return {
                "cas_username":"conditionalaccess_198",
                "cas_password":"11111",
                'provider_sign_key': 'jernkVsZ6j3LheMnStCAVmSncyXDBBmVSGfcWr1WQAA=',
                'iv': 'h3jAqQOGlps/swgz5b0Kww==',
                'key': 'b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=',
                'provider': 'kaltura'};
        else
            return {'provider_sign_key': 'jernkVsZ6j3LheMnStCAVmSncyXDBBmVSGfcWr1WQAA=', 
                    'iv': 'h3jAqQOGlps/swgz5b0Kww==', 
                    'key': 'b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=', 
                    'provider': 'kaltura'};
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
                "url": "192.168.56.101",
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
