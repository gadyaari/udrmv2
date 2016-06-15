/**
 * This is basic Generic-Entitlement
 * act as class who communicate with CAS servers and retrieve entitlement
 * Created by David.Winder on 6/14/2016.
 */
var util = require('util');

var base = require('../KalturaBase');


class GenericEntitlement
{
    constructor(server, customData , can_skip) {
        this.server = server;
        // set default can_skip = false
        if (typeof can_skip === 'undefined')
            can_skip = false;
        //for hard-coded - if we want to skip
        this.can_skip = can_skip;

        this.content_id = customData.content_id;
        this.flavorIds = customData.files;   // in test in ""
    }
    
    static valid(server)
    {
        return true;
    }

    getEntitlement()
    {
        KalturaLogger.log("in getEntitlement of GenericEntitlement");
    }
}


module.exports = GenericEntitlement;


