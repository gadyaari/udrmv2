const crypto = require('crypto');
const Promise = require('bluebird');
const https = require('https');
const util = require('util');

const drmManager = require('./abstractKalturaDrmManager');
const wvProto = require('../wv_proto_schema_pb');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const base = require('../KalturaBase');

class KalturaWidevineManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('cenc');
    }

    start(app)
    {
        super.start(app);
        app.post('/cenc/widevine/license', (...args) => this.license(...args));
        //app.get('/system/ca_system/.+/edash/p/.*/entryId/.*/flavorId/.*', (...args) => this.outsideencryption(...args));
        const outsideEncryptionUrlFormat = '/system/ovp/edash/p/:partnerId/sp/:sp/serveFlavor/entryId/:entryId/v/1/flavorId/:flavorId/forceproxy/true/name/a.mp4.urlset';
        app.get(outsideEncryptionUrlFormat, (...args) => this.outsideencryption(...args));
    }

    createPssh(keyId, keyIdUnbase, key, contentId, provider, trackType)
    {
        const pssh = {};
        pssh.uuid = 'edef8ba9-79d6-4ace-a3c8-27dcd51d21ed';
        const psshData = new wvProto.WidevineCencHeader();
        psshData.setAlgorithm(1);
        psshData.setKeyIdList([new Uint8Array(keyIdUnbase.split('').map(
                                                                                        function (c)
                                                                                        {
                                                                                            return c.charCodeAt(0);
                                                                                        }))]);
        psshData.setProvider(provider);
        psshData.setContentId(new Uint8Array(contentId.split('').map(
                                                                        function (c)
                                                                        {
                                                                            return c.charCodeAt(0);
                                                                        })));
        psshData.setContentId(new Uint8Array(Buffer.from(contentId)));
        psshData.setTrackType(trackType);
        pssh.data = Buffer.from(psshData.serializeBinary(), 'binary').toString('base64');
        return pssh;
    }


    getLicenseResponse(providerData, customData, payload, entResponse, files)
    {
        const This = this;
        const base64Payload = Buffer.from(payload, 'binary').toString('base64');
        const dbPrefix = `${this._drmType}_${customData.account_id}`;
        const contentKeys = this._getFiles(customData.files, customData.content_id, files, dbPrefix);
        const encryptionDataPromise = kalturaCouchbaseConnector.getInstance().getMulti(contentKeys, true);

        return new Promise(function (resolve, reject)
        {
            encryptionDataPromise.then(
                function (encryptionData)
                {
                    const msg = {
                        payload: base64Payload,
                        //parse_only:True,
                        content_id: Buffer.from(customData.content_id).toString('base64'),
                        policy_overrides: This._buildPolicyOverrides(providerData, customData, entResponse),
                        provider: providerData.provider,
                        content_key_specs: This._buildContentKeySpecs(encryptionData, customData),
                        allowed_track_types: 'SD_HD',
                    };
                    const msgStr = JSON.stringify(msg);
                    const signature = This._signRequest(msgStr, Buffer.from(providerData.key, 'base64'), Buffer.from(providerData.iv, 'base64'));
                    const request = {
                        signer: providerData.provider,
                        signature: signature,
                        request: Buffer.from(msgStr).toString('base64'),
                    };
                    //let request = '{'request':'+JSON.stringify(msg)+',signature:'+signature+',signer:'+providerData.provider+'}';
                    const licensePath = `${KalturaConfig.config.udrm.CENC_WIDEVINE_PATH}/${providerData.provider}`;
                    //TODO change this to use "request" instead of http
                    const postReq = https.request({
                        method: 'POST',
                        protocol: KalturaConfig.config.udrm.CENC_WIDEVINE_PROTOCOL,
                        hostname: KalturaConfig.config.udrm.CENC_WIDEVINE_HOST,
                        path: licensePath,
                    },
                    function (postResponse)
                    {
                        let body = '';
                        postResponse.on('data', function (d)
                        {
                            body += d;
                        });
                        postResponse.on('end', function ()
                        {
                            try
                            {
                                KalturaLogger.log(`got data from google [${body}]`);
                                const licResult = JSON.parse(body);
                                if (licResult.status !== 'OK') {
                                    reject('License result not OK');
                                    return;
                                }
                                resolve(Buffer.from(licResult.license, 'base64'));
                            }
                            catch (exception)
                            {
                                KalturaLogger.error(exception.stack);
                                reject(`Could not parse response [${body}]`);
                                return;
                            }
                        });
                    });
                    KalturaLogger.debug(`@@NA sending post data to google [${JSON.stringify(request)}]`);
                    postReq.write(JSON.stringify(request));
                    postReq.end();
                },
                function (err)
                {
                    KalturaLogger.error(`Could not get all keys from DB [${util.inspect(err)}]`);
                }
            );
        });
    }

    _signRequest(msgStr, key, iv)
    {
        const shaRequest = crypto.createHash('sha1');
        shaRequest.update(msgStr);
        let shaMsg = shaRequest.digest('binary');
        for (let i = shaMsg.length; i < 32; i++)
        {
            shaMsg += String.fromCharCode(0x00);
        }

        const signature = base.KalturaBase.prototype.encrypt(shaMsg, key, {iv:iv, disablePadding:true});
        return signature;
    }

    _buildPolicyOverrides(providerData, customData, entResponse)
    {
        const policyOverrides = {};
        policyOverrides.can_play = true;
        policyOverrides.license_duration_seconds = entResponse.duration;
        return policyOverrides;
    }

    _buildContentKeySpecs(encryptionData, customData)
    {
        const contentKeySpecs = [];
        if (Object.keys(encryptionData).length > 0)
        {
            const contentKey = Object.keys(encryptionData)[0];
            const currContentKeySpec = {};
            currContentKeySpec.track_type = 'SD_HD';
            currContentKeySpec.key = encryptionData[contentKey].value.key;
            currContentKeySpec.key_id = encryptionData[contentKey].value.key_id;
            contentKeySpecs.push(currContentKeySpec);
        }
        return contentKeySpecs;
    }
}

module.exports.KalturaWidevineManager = KalturaWidevineManager;
