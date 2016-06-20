const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');

class KalturaProviderData
{
    constructor(drmType, accountId)
    {
        
    }
    
    getProviderData()
    {
        return {'provider_sign_key': 'jernkVsZ6j3LheMnStCAVmSncyXDBBmVSGfcWr1WQAA=', 
                'iv': 'h3jAqQOGlps/swgz5b0Kww==', 
                'key': 'b1Wnx49V07a1IafqvYRbVcUsD5F7bj26Mkbt4MzAtBU=', 
                'provider': 'kaltura'};
    }
    
    getCasData() {
        return {
            "uri": "http://centos.kaltura/api_v3/index.php?service=drm_drmlicenseaccess&action=getaccess&entryId={content_id}&flavorIds={files}&ks={user_token}&format=1&referrer=",
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
