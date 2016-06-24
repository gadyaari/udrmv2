/**
 * This class is for OTT entitlement
 * Created by David.Winder on 7/15/2016.
 */
var util = require('util');

var OTTClient = require('./OTTClient');
var genericEntitlement = require('./GenericEntitlement');


class OTTEntitlement extends genericEntitlement {
    constructor(customData, providerData, canSkip)
    {
        super(customData, providerData, canSkip);

        this._partnerDataPromise = providerData.getPartnerData();
        this._accountId = customData.account_id;
        this._udid = customData.udid;
        this._systemType = customData.ca_system; // as OTT

        if (!OTTEntitlement.valid(customData))
        {
            KalturaLogger.error("customData: " + JSON.stringify(customData, null, 2));
            throw Error("non-valid parameters in OVPEntitlement constructor");
        }
            
    }


    static valid(customData) {
        if (customData.ca_system !== "OTT") return false;
        return super.valid();
    }


    getEntitlement() {
        let This = this;
        return super.getEntitlement().then(
            function (result) {
                var path = result.path;
                return This._partnerDataPromise.then(
                    function (result) {
                    var sWSUserName = result.cas_username;
                    var sWSPassword = result.cas_password;
                    var sMediaFileID = This.contentId;
                    var sSiteGUID = This._accountId;
                    var bIsCoGuid = "True";
                    var sCOUNTRY_CODE = "";
                    var sLANGUAGE_CODE = "";
                    var sDEVICE_NAME = This._udid;
                    var client = new OTTClient(This.url, path);
                    return client.getDRMAccess(sWSUserName, sWSPassword, sMediaFileID, sSiteGUID, bIsCoGuid, sCOUNTRY_CODE, sLANGUAGE_CODE, sDEVICE_NAME);
                },
                    function(err)
                    {
                        KalturaLogger.error("Error from KalturaProviderData::getPartnerData() promise");
                        throw err;
                    });
            });
    }

}
module.exports = OTTEntitlement;


