/**
 * This class is for OVP entitlement
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');

var OVPClient = require('./OVPClient');
var genericEntitlement = require('./GenericEntitlement');


class OVPEntitlement extends genericEntitlement
{
    constructor(server, customData , can_skip)
    {
        if (!OVPEntitlement.valid(server, customData))
            throw Error("non-valid parameters in OVPEntitlement constructor");

        //call super.constructor
        super(server, customData , can_skip);
        this._ks = customData.user_token;
        this._systemType = customData.ca_system; // as OVP
    }

    static valid(server, customData) 
    {
        if (customData.ca_system !== "OVP") return false;
        return super.valid(server);
    }

    getEntitlement()
    {
        var c = new OVPClient(this.server, this._ks);
        return c.getDRMaccess(this.content_id, this.flavorIds, "");
    }

}

module.exports = OVPEntitlement;


