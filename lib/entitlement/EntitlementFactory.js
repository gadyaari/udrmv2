/** this file will be factory to generate entitlement
 * for now this will have 2 type: OVP or OTT
 * Created by David.Winder on 6/20/2016.
 */
var OVP = require('./OVPEntitlement');
var OTT = require('./OTTEntitlement');


class EntitlementFactory {
    static createEntitlement(customData , providerData) {
        if (customData.ca_system == "OVP")
            return new OVP(customData, providerData);
        else if (customData.ca_system == "OTT") {
            return new OTT(customData, providerData);
        }
    }
}

module.exports = EntitlementFactory;