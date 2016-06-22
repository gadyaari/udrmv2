
const util = require('util');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');

const kalturaBase = require('../KalturaBase');

class KalturaAdminManager extends kalturaBase.KalturaBase {

    start(app) {
        app.post('/admin/addPartner', this.addPartner.bind(this));
        app.post('/admin/getPartner', this.getPartner.bind(this));
    };

    addPartner(request, response) {
        var This = this;
        KalturaLogger.log("@@NA doing add action action [" + util.inspect(request.body) + "]");
        if (!this.validate(request)) {
            this.errorResponse(response, 403, "Request could not be validated");
            return;
        }

        var partnerKey = request.body.drmType + "_" + request.body.partnerId;
        var partnerDoc = {
            "provider_sign_key": request.body.providerSignKey,
            "iv": request.body.iv,
            "key": request.body.key
        };
        if ((typeof request.body.seed) != 'undefined') {
            partnerDoc.seed = request.body.seed;
        }
        var partnerDocUpserted = function (result) {
            var responseObj = {'status': 'OK'};
            This.okResponse(response, JSON.stringify(responseObj), 'application/json');
        };

        kalturaCouchbaseConnector.getInstance().upsert(partnerKey, partnerDoc, true).then(partnerDocUpserted, partnerDocUpserted);
    };

    getPartner(request, response) {
        var This = this;
        var partnerKey = request.body.drmType + "_" + request.body.partnerId;
        if (!this.validate(request)) {
            this.errorResponse(response, 403, "Request could not be validated");
            return;
        }

        function partnerDocReturn(result) {
            This.okResponse(response, JSON.stringify(result.value), 'application/json');
        };
        function partnerDocErr(err) {
            This.errorResponse(response, 500, "Could not get partner doc [" + util.inspect(err) + "]");
        };
        kalturaCouchbaseConnector.getInstance().get(partnerKey, true).then(partnerDocReturn, partnerDocErr);
    };

    validate(request)//TODO: implement this
    {
        KalturaLogger.log("Admin request validated");
        return true;
    };
}

module.exports.KalturaAdminManager = KalturaAdminManager;