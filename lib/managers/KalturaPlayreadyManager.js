const crypto = require('crypto');
const Promise = require('bluebird');
const https = require('https');
const util = require('util');
const xmlbuilder = require('xmlbuilder');

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
        pssh.uuid = '9a04f079-9840-4286-ab92-e65be0885f95';
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
        const base64Payload = Buffer.from(payload, 'binary').toString('base64');
        const dbPrefix = this._drmType + '_' + customData.account_id;
        const contentKeys = this._getFiles(customData.files, customData.content_id, files, dbPrefix);
        const encryptionDataPromise = kalturaCouchbaseConnector.getInstance().getMulti(contentKeys, true);

        return new Promise(function(resolve,reject) {
            encryptionDataPromise.then(
                function (encryptionData) {
                    let msg = {
                        'payload': base64Payload,
                        //'parse_only':True,
                        'content_id': Buffer.from(customData.content_id).toString('base64'),
                        'policy_overrides': This._build_policy_overrides(providerData, customData, entResponse),
                        'provider': providerData.provider,
                        'content_key_specs': This._build_content_key_specs(encryptionData, customData),
                        'allowed_track_types': 'SD_HD'
                    };
                    let msgStr = JSON.stringify(msg);
                    let signature = This._signRequest(msgStr, Buffer.from(providerData.key, 'base64'), Buffer.from(providerData.iv, 'base64'));
                    let request = {
                        signer: providerData.provider,
                        signature: signature,
                        request: Buffer.from(msgStr).toString('base64')
                    };
                    //let request = '{'request':'+JSON.stringify(msg)+',signature:'+signature+',signer:'+providerData.provider+'}';
                    let licensePath = KalturaConfig.config.udrm.CENC_WIDEVINE_PATH + '/' + providerData.provider;
                    let postReq = https.request({
                            method: 'POST',
                            protocol: KalturaConfig.config.udrm.CENC_WIDEVINE_PROTOCOL,
                            hostname: KalturaConfig.config.udrm.CENC_WIDEVINE_HOST,
                            path: licensePath
                        },
                        function (postResponse) {
                            var body = '';
                            postResponse.on('data', function (d) {
                                body += d;
                            });
                            postResponse.on('end', function () {
                                try {
                                    KalturaLogger.log('got data from google ['+body+']');
                                    var licResult = JSON.parse(body);
                                    if (licResult.status != 'OK') {
                                        reject('License result not OK');
                                        return;
                                    }
                                    resolve(Buffer.from(licResult.license, 'base64'));
                                }
                                catch(exception){
                                    KalturaLogger.error(exception.stack);
                                    reject('Could not parse response ['+body+']');
                                    return;
                                }
                            });
                        });
                    KalturaLogger.debug('@@NA sending post data to google ['+JSON.stringify(request)+']');
                    postReq.write(JSON.stringify(request));
                    postReq.end();
                },
                function (err) {
                    KalturaLogger.error('Could not get all keys from DB ['+util.inspect(err)+']');
                }
            );
        });
    }

    _signRequest(msgStr, key, iv)
    {
        let shaRequest = crypto.createHash('sha1');
        shaRequest.update(msgStr);
        let shaMsg = shaRequest.digest('binary');
        for (let i = shaMsg.length; i<32; i++)
        {
            shaMsg += String.fromCharCode(0x00);
        }

        let signature = base.KalturaBase.prototype.encrypt(shaMsg, key, {iv:iv, disablePadding:true});
        return signature;
    }

    _build_policy_overrides(providerData, customData, entResponse)
    {
        const policyOverrides = {};
        policyOverrides.can_play = true;
        policyOverrides.license_duration_seconds = entResponse.duration;
        return policyOverrides;
    }

    _build_content_key_specs(encryptionData, customData)
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
        //for (let contentKey in encryptionData)
        //{
        //    let currContentKeySpec = {};
        //    currContentKeySpec.track_type = 'SD_HD';
        //    currContentKeySpec.key = encryptionData[contentKey].value.key;
        //    currContentKeySpec.key_id = encryptionData[contentKey].value.key_id;
        //    contentKeySpecs.push(currContentKeySpec);
        //}
        return contentKeySpecs;
    }

    _getFiles(verifiedFiles, contentId, files, dbPrefix)
    {
        if ( verifiedFiles == 'undefined')
            return contentId.map(function(curr, index, arr){return dbPrefix + '_' + curr;});
        let verifiedFilesArr = verifiedFiles.split(',');
        if (typeof files == 'undefined')
            return verifiedFilesArr.map(function(curr, index, arr){return dbPrefix + '_' + contentId + '_' + curr;});

        let retVal = [];
        let filesArr = Buffer.from(files, 'base64').toString('ascii').split(',');
        for (let i = 0; i < filesArr.length; i++)
        {
            if (verifiedFilesArr.indexOf(filesArr[i]) != -1)
                retVal.push(dbPrefix + '_' + contentId + '_' + filesArr[i]);
            else
                return new Error('Files cannot be verified');
        }
        return retVal;
    }

}

module.exports.KalturaPlayreadyManager = KalturaPlayreadyManager;