/**
 * This is basic Generic-Entitlement
 * act as class who communicate with CAS servers and retrieve entitlement
 * Created by David.Winder on 6/14/2016.
 */
var util = require('util');

var base = require('../KalturaBase');


class GenericEntitlement
{
    constructor(customData ,providerData, canSkip) {
        // set default can_skip = false
        if (typeof canSkip === 'undefined')
            canSkip = false;
        //for hard-coded - if we want to skip
        this.canSkip = canSkip;
        this._casDataPromise = providerData.getCasData();
        this.contentId = customData.content_id;
        this.flavorIds = customData.files;   // in test in ""
    }
    
    static valid()
    {
        return true;
    }

    getEntitlement()
    {
        let This = this;
        return this._casDataPromise.then(
            function(result)
            {
                This.url = result.url;
                return result;
            },
            function(err)
            {
                KalturaLogger.error("Error from KalturaProviderData::getCasData() promise");
                throw Error(err);
            }
        );






    }
}


module.exports = GenericEntitlement;


