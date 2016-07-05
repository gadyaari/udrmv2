const crypto = require('crypto');
const Promise = require('bluebird');
const https = require('https');
const util = require('util');
const xmlbuilder = require('xmlbuilder');
const httpRequest = require('request');

const drmManager = require('./KalturaDrmManager');
const wvProto = require('../wv_proto_schema_pb');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const base = require('../KalturaBase');

class KalturaPlayreadyManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('cenc');
        this._swap = true;
        this._serviceUUID = '9a04f079-9840-4286-ab92-e65be0885f95';
    }

    start(app)
    {
        super.start(app);
        app.post('/cenc/playready/license', (...args) => this.license(...args));
        //TODO Add outside encrypition for EMSS
        //app.get('/system/ca_system/.+/edash/p/.*/entryId/.*/flavorId/.*', (...args) => this.outsideencryption(...args));
        //app.get('/system/ovp/edash/p/:partnerId/sp/:sp/serveFlavor/entryId/:entryId/v/1/flavorId/:flavorId/forceproxy/true/name/a.mp4.urlset', (...args) => this.outsideencryption(...args));
    }

    createPssh(keyId, keyIdUnbase, key, contentId, provider, trackType)
    {
        const pssh = {};
        pssh.uuid = this._serviceUUID;
        const psshData = xmlbuilder.create('root');
        const wrmHeader = psshData.ele('WRMHEADER', { version: '4.0.0.0', xmlns: 'http://schemas.microsoft.com/DRM/2007/03/PlayReadyHeader' });
        const data = wrmHeader.ele('DATA');
        const protectionInfo = data.ele('PROTECTINFO');
        protectionInfo.ele('KEYLEN', {}, '16');
        protectionInfo.ele('ALGID', {}, 'AESCTR');
        data.ele('KID', {}, keyId);
        data.ele('CHECKSUM', {}, this._calculateCheckSum(key, keyIdUnbase));
        data.ele('LA_URL', {}, 'http://ubuntudrm/cenc/playready/license');//TODO build LA_URL
        data.ele('LUI_URL', {}, 'http://www.kaltura.com');
        pssh.data = Buffer.from(wrmHeader.toString(), 'ucs2').toString('base64');
        //KalturaLogger.debug(`@@NA pssh created ${wrmHeader.toString()}`);
        return pssh;
    }

    _calculateCheckSum(key, keyIdUnbase)
    {
        const aes128 = crypto.createCipheriv('AES-128-ECB', Buffer.from(key, 'base64'), Buffer.alloc(0, 0));
        let encrypted = aes128.update(keyIdUnbase, 'binary', 'base64');
        encrypted += aes128.final('base64');
        return encrypted.substr(0, 8);
    }

    getLicenseResponse(providerData, customData, payload, entResponse, files)
    {
        const This = this;
        const dbPrefix = `${this._drmType}_${customData.account_id}`;
        const contentKeys = this._getFiles(customData.files, customData.content_id, files, dbPrefix);
        const encryptionDataPromise = kalturaCouchbaseConnector.getInstance().getMulti(contentKeys, true);

        return new Promise(function(resolve,reject) {
            encryptionDataPromise.then(
                function (encryptionData) {
                    const playreadyLicneseRequestData = {
                        entitlement: {
                            duration: entResponse.duration,
                            absolute_duration: new Date(entResponse.absolute_duration).toISOString(),
                        },
                        policy: entResponse.policy,
                        content_data: This._getContentKeys(encryptionData),
                        service_id: '9a04f079-9840-4286-ab92-e65be0885f95',
                    };


                    const options = {
                        headers: {
                            'content-type': 'text/xml; charset=utf-8',
                            'x-udrm-request-data': Buffer.from(JSON.stringify(playreadyLicneseRequestData), 'ascii').toString('base64'),
                            SOAPAction: 'http://schemas.microsoft.com/DRM/2007/03/protocols/AcquireLicense',
                        },
                        body: payload,
                    };

                    function licenseResponseCB(error, response, body)
                    {
                        KalturaLogger.log(`got data from playready [${body}]`);
                        if (response === 200)
                        {
                            resolve(body);
                            return;
                        }
                        reject(error);
                    }

                    KalturaLogger.debug(`@@NA sending to playready ${util.inspect(options)}`);

                    httpRequest.post(KalturaConfig.config.udrm.CENC_PLAYREADY_SERVER, options, licenseResponseCB);
                },
                function (err)
                {
                    KalturaLogger.error(`Could not get all keys from DB [${util.inspect(err)}]`);
                }
            );
        });
    }

    _getContentKeys(encryptionData)
    {
        const contentKeys = [];
        //for (let currEncKey = 0; currEncKey < encryptionData.length; currEncKey++)
        for (let currEncKey in encryptionData)
        {
            contentKeys.push({
                key_id: this._swapKeyId(encryptionData[currEncKey].value.key_id, true),
                key: encryptionData[currEncKey].value.key,
            });
        }
        return contentKeys;
    }
}

module.exports.KalturaPlayreadyManager = KalturaPlayreadyManager;