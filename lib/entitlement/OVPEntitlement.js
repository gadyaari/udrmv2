/**
 * This class is for OVP entitlement
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');

var OVPClient = require('./OVPClient');
var genericEntitlement = require('./GenericEntitlement');


class OVPEntitlement extends genericEntitlement
{
    constructor(customData , providerData, can_skip)
    {
        super(customData ,providerData, can_skip);
        
        this._ks = customData.user_token;
        this._systemType = customData.ca_system; // as OVP

        if (!OVPEntitlement.valid(customData))
        {
            KalturaLogger.error("customData: " + JSON.stringify(customData, null, 2));
            throw Error("non-valid parameters in OVPEntitlement constructor");
        }

    }


    static valid(customData) 
    {
        if (customData.ca_system !== "OVP") return false;
        return super.valid();
    }

    getEntitlement()
    {
        let This = this;
        return super.getEntitlement().then (
            function(result)
            {
                var client = new OVPClient(This.url, This._ks);
                return client.getDRMAccess(This.contentId, This.flavorIds, "");
            },
            function(err)
            {
                throw err;
            }
        );
    }

}

module.exports = OVPEntitlement;


