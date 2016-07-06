const Promise = require('bluebird');

const kalturaCouchbaseConnector = require('./utils/KalturaCouchbaseConnector');
require('../lib/utils/KalturaConfig');


class KalturaProviderData
{
    constructor(drmType, accountId, caSystem = 'OVP')
    {
        this._drmType = drmType;
        this._accountId = accountId;
        this._caSystem = caSystem;
    }

    getPartnerData()
    {
        const providerKey = `${this._drmType}_${this._accountId}`;
        return kalturaCouchbaseConnector.getInstance().get(providerKey, true);
    }

    getCasData() {
        return new Promise(function(resolve,reject)
        {
            if (this._caSystem === 'OVP')
            {
                const ovpResponse = KalturaConfig.config.OVP_Server_data;
                resolve(ovpResponse);
                return;
            }
            //TODO deal with OTT cas data
            ottMockResponse = KalturaConfig.config.getCasDataOttMockResponse;
            resolve(ottMockResponse);
        });
    }
}

module.exports.KalturaProviderData = KalturaProviderData;
