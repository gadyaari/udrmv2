/** this file will be factory to generate entitlement
 * for now this will have 2 type: OVP or OTT
 * Created by David.Winder on 6/20/2016.
 */
var OVP = require('./OVPEntitlement');
var OTT = require('./OTTEntitlement');


class EntitlementFactory {
    static createEntitlement(customData , provider_data) {
        if (customData.ca_system == "OVP")
            return new OVP(customData, provider_data);
        else if (customData.ca_system == "OTT")
            return new OTT(customData, provider_data);
    }
}

module.exports = EntitlementFactory;