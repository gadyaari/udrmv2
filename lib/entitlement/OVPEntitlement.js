/**
 * This class is for OVP entitlement
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');

var OVPClient = require('./OVPClient');
var genericEntitlement = require('./GenericEntitlement');


class OVPEntitlement extends genericEntitlement
{
    constructor(customData , provider_data, can_skip)
    {
        var casData = provider_data.getCasData();

        //call super.constructor
        super(casData.url, customData , can_skip);
        
        this._ks = customData.user_token;
        this._systemType = customData.ca_system; // as OVP
        
        if (!OVPEntitlement.valid(casData.url, customData))
            throw Error("non-valid parameters in OVPEntitlement constructor");

    }


    static valid(server, customData) 
    {
        if (customData.ca_system !== "OVP") return false;
        return super.valid(server);
    }

    getEntitlement()
    {
        var client = new OVPClient(this.server, this._ks);
        return client.getDRMaccess(this.content_id, this.flavorIds, "");
    }

}

module.exports = OVPEntitlement;


