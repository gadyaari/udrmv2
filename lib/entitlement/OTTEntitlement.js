/**
 * This class is for OTT entitlement
 * Created by David.Winder on 7/15/2016.
 */
var util = require('util');


var genericEntitlement = require('./GenericEntitlement');


class OTTEntitlement extends genericEntitlement
{
    constructor(server, customData , can_skip)
    {

        if (!OTTEntitlement.valid(server, customData))
            throw Error("non-valid parameters in OVPEntitlement constructor");

        //call super.constructor
        super(server, customData , can_skip);

        this._provider_data = customData.provider_data;
        this._systemType = customData.ca_system; // as OTT
    }

    static valid(server, customData) 
    {
        if (customData.ca_system !== "OTT") return false;
        return super.valid(server);
    }

    getEntitlement()
    {
        //TODO connect to OTT
    }

}

module.exports = OTTEntitlement;


