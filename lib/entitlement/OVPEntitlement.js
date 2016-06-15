/**
 * This class is for OVP entitlement
 * Created by David.Winder on 6/15/2016.
 */
var util = require('util');

var OVPClient = require('./OVPClient');
var genericEntitlement = require('./GenericEntitlement');

module.exports = OVPEntitlement;
util.inherits(OVPEntitlement, genericEntitlement);

function OVPEntitlement(server, customData , providerData, can_skip) {

    var valid = function(server, customData) {
        if (customData.ca_system !== "OVP") return false;
        return true;
    }

    if (!valid(server, customData)) {
        throw Error("non-valid parameters in OVPEntitlement constructor");
    }

    //call super.constructor
    genericEntitlement.call(this,server, customData , can_skip);
    
    this.ks = customData.user_token;
    this.systemType = customData.ca_system; // as OVP
};

OVPEntitlement.prototype.getEntitlement = function()
{

    var c = new OVPClient(this.server, this.ks);
    return c.getDRMaccess(this.content_id, this.flavorIds, "");

};






