/**
 * This class is for OTT entitlement
 * Created by David.Winder on 7/15/2016.
 */
var util = require('util');

var OTTClient = require('./OTTClient');
var genericEntitlement = require('./GenericEntitlement');


class OTTEntitlement extends genericEntitlement
{
    constructor(server, path, customData , provider_data, can_skip)
    {
        if (!OTTEntitlement.valid(server, customData, provider_data))
            throw Error("non-valid parameters in OVPEntitlement constructor");

        //call super.constructor
        super(server, customData , can_skip);

        this._path = path;
        this._cas_username = provider_data.cas_username;
        this._cas_password = provider_data.cas_password;
        this._account_id = customData.account_id;
        this._udid = customData.udid;
        this._systemType = customData.ca_system; // as OTT
    }

    static valid(server, customData, provider_data)
    {
        if (customData.ca_system !== "OTT") return false;
        return super.valid(server);
    }

    getEntitlement()
    {
        var sWSUserName = this._cas_username;
        var sWSPassword = this._cas_password;
        var sMediaFileID = this.content_id;
        var sSiteGUID = this._account_id;
        var bIsCoGuid = "True";
        var sCOUNTRY_CODE = "";
        var sLANGUAGE_CODE = "";
        var sDEVICE_NAME = this._udid;
        
        var client = new OTTClient(this.server ,this._path);
        return client.getDRMaccess(sWSUserName,sWSPassword, sMediaFileID, sSiteGUID, bIsCoGuid, sCOUNTRY_CODE, sLANGUAGE_CODE, sDEVICE_NAME);
    }
}

module.exports = OTTEntitlement;


