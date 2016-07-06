const util = require('util');
const crypto = require('crypto');

const kalturaBase = require('../KalturaBase');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const entitlementFactory = require('../entitlement/EntitlementFactory');
const kalturaProviderData = require('../KalturaProviderData');

class KalturaDrmManager extends kalturaBase.KalturaBase
{
    constructor(drmType)
    {
        super();
        if (drmType)
            this._drmType = drmType;
        else
            this._drmType = 'cenc';
        KalturaDrmManager.registerCencProvider(this);
        this._swap = false;
    }

    start(app)
    {
        app.post('/cenc/encryption', (...args) => this.encryption(...args));
        app.get('/system/ovp/edash/p/:partnerId/sp/:sp/entryId/:entryId/flavorId/:flavorId/[a-zA-Z0-9/]*$', (...args) => this.outsideencryption(...args));
    }

    static registerCencProvider(provider)
    {
        if (!this._cencProviders)
        {
            this._cencProviders = [];
        }
        this._cencProviders.push(provider);
    }

    encryption(request, response)
    {
        const This = this;

        KalturaLogger.newLog('doing encryption action %s', util.inspect(request.body));
        const providerKey = `${this._drmType}_${request.body.account_id}`;

        function validateRequest (providerData)
        {
            if (This.internalRequest || This.validate(request.rawBody, request.query.signature, providerData))
            {
                KalturaLogger.newLog('Validation success what now');
                const encryptionDataPromise = This.createEncryptionData(providerData.value, request.body);
                encryptionDataPromise.then(
                    function (encryptionData)
                    {
                        This.okResponse(response, JSON.stringify(encryptionData), 'application/json');
                    },
                    function (err)
                    {
                        This.errorResponse(response, 500, JSON.stringify(err));
                    }
                );
            }
            else
            {
                This.errorResponse(response, 403, "Request could not be validated");
                return;
            }
        };

        const providerDataPromise = kalturaCouchbaseConnector.getInstance().get(providerKey, true);
        providerDataPromise.then(validateRequest,
            function ()
            {
                This.errorResponse(response, 405, 'Could not get provider data');
            }
        );
    }

    // TODO for encryption requests should do all cenc encryption requests
    createEncryptionData(providerData, postParams)
    {
        const This = this;
        const dbKey = `${this._drmType}_${postParams.account_id}_${postParams.content_id}_${postParams.files}`;
        KalturaLogger.debug(`@@NA dbKey ${dbKey}`);
        const encryptionDataPromise = kalturaCouchbaseConnector.getInstance().get(dbKey, true);
        function encryptionDataExists(encryptionData)
        {
            return [encryptionData.value];
        }

        function encryptionDoesntExist(err)
        {
            KalturaLogger.log('creating encrypiton data');
            const sharedKey = `cenc_${postParams.account_id}_${postParams.content_id}`;

            if (typeof providerData.seed === 'undefined')
            {
                const commonSeedPromise = kalturaCouchbaseConnector.getInstance().get('udrm_common_seed', true);
                return commonSeedPromise.then(
                    function (result)
                    {
                        const newEncryptionData = This.createNewEncryptionData(providerData, postParams, result.value.seed, sharedKey, This._swap);
                        kalturaCouchbaseConnector.getInstance().upsert(dbKey, newEncryptionData, true);
                        return [newEncryptionData];
                        // TODO check what to do with upsert response.
                    },
                    function (udrmCommonSeedErr)
                    {
                        KalturaLogger.error(`Could not get udrm_common_seed [${util.inspect(udrmCommonSeedErr)}`);
                    });
            }
            const newEncryptionData = This.createNewEncryptionData(providerData, postParams, providerData.seed, sharedKey, This._swap);
            kalturaCouchbaseConnector.getInstance().upsert(dbKey, newEncryptionData, true);
            return [newEncryptionData];

        }
        return encryptionDataPromise.then(encryptionDataExists, encryptionDoesntExist);
        //return encryptionDataPromise.then(encryptionDoesntExist, encryptionDoesntExist);
    }

    createNewEncryptionData(providerData, postParams, seed, sharedKey, swap)
    {
        const seedBytes = Buffer.from(seed, 'base64').toString('binary');
        const md5 = crypto.createHash('md5');
        md5.update(seedBytes, 'binary');
        md5.update(sharedKey);
        md5.update(seedBytes, 'binary');
        const keyId = md5.digest('base64');
        const keyIdUnbase = Buffer.from(keyId, 'base64');

        const shaA = crypto.createHash('sha256');
        shaA.update(seedBytes, 'binary');
        shaA.update(keyIdUnbase, 'binary');
        const hashA = shaA.digest('binary');

        const shaB = crypto.createHash('sha256');
        shaB.update(seedBytes, 'binary');
        shaB.update(keyIdUnbase, 'binary');
        shaB.update(seedBytes, 'binary');
        const hashB = shaB.digest('binary');

        const shaC = crypto.createHash('sha256');
        shaC.update(seedBytes, 'binary');
        shaC.update(keyIdUnbase, 'binary');
        shaC.update(seedBytes, 'binary');
        shaC.update(keyIdUnbase, 'binary');
        const hashC = shaC.digest('binary');

        let keyOrig = '';
        for (let i = 0; i < 16; i++)
        {
            keyOrig += String.fromCharCode(hashA.charCodeAt(i) ^ hashA.charCodeAt(i + 16) ^
                hashB.charCodeAt(i) ^ hashB.charCodeAt(i + 16) ^
                hashC.charCodeAt(i) ^ hashC.charCodeAt(i + 16)
            );
        }

        const key = Buffer.from(keyOrig, 'binary').toString('base64');
        let keyIdUnbaseStr = keyIdUnbase.toString('binary');
        let keyIdSwapped = keyId;
        if (swap)
        {
            keyIdUnbaseStr = this._swapKeyId(keyIdUnbaseStr);
            keyIdSwapped = Buffer.from(keyIdUnbaseStr, 'binary').toString('base64');
        }

        const retVal = {};
        retVal.key_id = keyId;
        retVal.key = key;

        retVal.pssh = [];
        for (let i = 0; i < KalturaDrmManager._cencProviders.length; i++)
        {
            const currPssh = KalturaDrmManager._cencProviders[i].createPssh(keyIdSwapped, keyIdUnbaseStr, key, postParams.content_id, providerData.provider, 'SD_HD');
            retVal.pssh.push(currPssh);
        }
        return retVal;
    }

    outsideencryption(request, response)
    {
        request.body.account_id = request.params.partnerId;
        request.body.content_id = request.params.entryId;
        request.body.files = request.params.flavorId;
        this.internalRequest = true;
        this.encryption(request, response);
    }

    validate(customDataStr, signature, providerData)
    {
        if (!signature)
            return false;
        const msg = providerData.value.provider_sign_key + customDataStr;
        const sha1 = crypto.createHash('sha1');
        sha1.update(msg);
        const hashMsg = sha1.digest('base64');
        if (signature === hashMsg)
        {
            KalturaLogger.newLog('request validated');
            return true;
        }

        KalturaLogger.newLog('request validation failed, expected [%s] got [%s]', hashMsg, signature);
        return false;
    }

    license(request, response)
    {
        const This = this;

        if ((typeof request.query.custom_data === 'undefined') || request.query.custom_data === '')
            this.errorResponse('400', 'No custom data given');
        KalturaLogger.newLog('doing license action %s', util.inspect(request.body));
        const customDataStr = Buffer.from(request.query.custom_data, 'base64').toString();
        const customData = JSON.parse(customDataStr);
        const providerData = new kalturaProviderData.KalturaProviderData(this._drmType, customData.account_id);
        const providerDataPromise = providerData.getPartnerData();

        function validateRequest(innerProviderData)
        {
            if (!This.validate(customDataStr, request.query.signature, innerProviderData))
            {
                This.errorResponse(response, 403, 'Request could not be validated');
                return;
            }

            KalturaLogger.newLog('Validation success what now');
            const entReq = entitlementFactory.createEntitlement(customData, providerData);
            const entResponsePromise = entReq.getEntitlement();
            function getLicenseWithEntitlement(entResponse)
            {
                const licenseResponsePromise = This.getLicenseResponse(innerProviderData.value, customData, request.rawBody, entResponse, request.query.files);
                licenseResponsePromise.then(
                    function (licenseResponse)
                    {
                        //TODO: change to express response
                        This.okResponse(response, licenseResponse, 'application/octet-stream');
                    },
                    function (err)
                    {
                        This.errorResponse(response, 500, JSON.stringify(err));
                    }
                );
            }
            function errorGettingEntitlement(error)
            {
                KalturaLogger.log(`error gettting entitlment [${util.inspect(error)}]`);
                This.errorResponse(response, 403, 'error while getting entitlement');
            }
            entResponsePromise.then(getLicenseWithEntitlement, errorGettingEntitlement);
        }

        providerDataPromise.then(validateRequest,
            function (error)
            {
                This.errorResponse(response, 405, 'Could not get provider data');
            }
        );
    }

    getLicenseResponse(providerData, customData, payload, entResponse, files)
    {
        return { status: 'unimplemented' };
    }

    _getFiles(verifiedFiles, contentId, files, dbPrefix)
    {
        if (verifiedFiles === 'undefined')
        {
            return contentId.map(
                function (curr)
                {
                    return `${dbPrefix}_${curr}`;
                });
        }
        const verifiedFilesArr = verifiedFiles.split(',');
        if (typeof files === 'undefined')
        {
            return verifiedFilesArr.map(
                function (curr)
                {
                    return `${dbPrefix}_${contentId}_${curr}`;
                });
        }
        const retVal = [];
        const filesArr = Buffer.from(files, 'base64').toString('ascii').split(',');
        for (let i = 0; i < filesArr.length; i++)
        {
            if (verifiedFilesArr.indexOf(filesArr[i]) !== -1)
                retVal.push(`${dbPrefix}_${contentId}_${filesArr[i]}`);
            else
                return new Error('Files cannot be verified');
        }
        return retVal;
    }

    _swapKeyId(keyIdStr, doBase64)
    {
        let innerKeyIdStr = keyIdStr;
        if (doBase64)
            innerKeyIdStr = Buffer.from(innerKeyIdStr, 'base64').toString('binary');
        innerKeyIdStr = innerKeyIdStr[3] + innerKeyIdStr[2] + innerKeyIdStr[1] + innerKeyIdStr[0] +
            innerKeyIdStr[5] + innerKeyIdStr[4] + innerKeyIdStr[7] + innerKeyIdStr[6] + innerKeyIdStr.substr(8);
        if (doBase64)
            innerKeyIdStr = Buffer.from(innerKeyIdStr, 'binary').toString('base64');
        return innerKeyIdStr;
    }

}

module.exports.KalturaDrmManager = KalturaDrmManager;
