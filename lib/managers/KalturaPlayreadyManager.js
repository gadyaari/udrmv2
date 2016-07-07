const crypto = require('crypto');
const Promise = require('bluebird');
const https = require('https');
const util = require('util');
const xmlbuilder = require('xmlbuilder');
const httpRequest = require('request');

const drmManager = require('./abstractKalturaDrmManager');
const wvProto = require('../wv_proto_schema_pb');
const kalturaCouchbaseConnector = require('../utils/KalturaCouchbaseConnector');
const base = require('../KalturaBase');

class KalturaPlayreadyManager extends drmManager.KalturaDrmManager
{
    constructor()
    {
        super('playready');
        this._swap = true;
        this._serviceUUID = '9a04f079-9840-4286-ab92-e65be0885f95';
    }

    start(app)
    {
        super.start(app);
        app.post('/cenc/playready/encryption', (...args) => this.encryption(...args));
        app.post('/cenc/playready/license', (...args) => this.license(...args));
	app.post('/playready/license', (...args) => this.license(...args));
	app.post('//playready/license', (...args) => this.license(...args));
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
                        policy: This._createPolicy(entResponse.policy),
			service_id: '9a04f079-9840-4286-ab92-e65be0885f95',
			content_data: This._getContentKeys(encryptionData),
			entitlement: {
//                            duration: 311040000, 
			    duration: entResponse.duration,
//			    absolute_duration: '2072-11-20T04:39:06Z'
                            absolute_duration: new Date(entResponse.duration * 1000).toISOString().replace('.000Z','Z'),
                        },
                    };


                    const options = {
                        headers: {
                            'content-type': 'text/xml; charset=utf-8',
			    //'x-udrm-request-data': 'eyJwb2xpY3kiOiB7InBhcmFtcyI6IHsiZW5hYmxlcnMiOiBbIjc4NjYyN0Q4LUMyQTYtNDRCRS04Rjg4LTA4QUUyNTVCMDFBNyJdLCAibWluaW11bV9zZWN1cml0eV9sZXZlbCI6IDIwMDB9LCAibmFtZSI6ICJkZWZhdWx0In0sICJzZXJ2aWNlX2lkIjogIjlhMDRmMDc5LTk4NDAtNDI4Ni1hYjkyLWU2NWJlMDg4NWY5NSIsICJjb250ZW50X2RhdGEiOiBbeyJrZXlfaWQiOiAiM2FrcU8yRkRIcEE1eVgrVlBRSFlEUT09IiwgImtleSI6ICJzeGdIZkU5aEtZYlhBa0x6UW15UHNnPT0ifV0sICJlbnRpdGxlbWVudCI6IHsiZHVyYXRpb24iOiAzMTEwNDAwMDAsICJhYnNvbHV0ZV9kdXJhdGlvbiI6ICIyMDcyLTExLTIwVDA0OjM5OjA2WiJ9fQ==',                            
			    'x-udrm-request-data': Buffer.from(JSON.stringify(playreadyLicneseRequestData)).toString('base64'),
                            SOAPAction: 'http://schemas.microsoft.com/DRM/2007/03/protocols/AcquireLicense',
                        },
                        body: payload,
                    };

                    function licenseResponseCB(error, response, body)
                    {
                        KalturaLogger.log(`got data from playready [${body}]`);
			KalturaLogger.log(`response ${util.inspect(response.statusCode)}`);
		        resolve(body);
			return;
                        if (response === 200)
                        {
                            resolve(body);
                            //return;
                        }
			else
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
        if (Object.keys(encryptionData).length > 0)
        {
            const contentKey = Object.keys(encryptionData)[0];
            contentKeys.push({
                //key_id: this._swapKeyId(encryptionData[contentKey].value.key_id, true),
                key_id: encryptionData[contentKey].value.key_id,
                key: encryptionData[contentKey].value.key,
            });
        }
        //for (let currEncKey in encryptionData)
        //{
        //    contentKeys.push({
        //        //key_id: this._swapKeyId(encryptionData[currEncKey].value.key_id, true),
        //        key_id: encryptionData[currEncKey].value.key_id,
        //        key: encryptionData[currEncKey].value.key,
        //    });
        //}
        return contentKeys;
    }

    _createPolicy(poliycName)
    {
        if (poliycName.indexOf('debug') > -1)
        {
            let policy = null;
            if ( (poliycName.indexOf('msl150') > -1) && (poliycName.indexOf('vmguid') > -1))
                policy =  {"params": {"minimum_security_level": 150 , "enablers": ["786627D8-C2A6-44BE-8F88-08AE255B01A7"] },"name": "default"};
            else if (poliycName.indexOf('msl150') > -1)
                policy =  {"params": {"minimum_security_level": 150 },"name": "default"};
            else if (poliycName.indexOf('vmguid') > -1)
                policy =  {"params": {"minimum_security_level": 2000 ,"enablers": ["786627D8-C2A6-44BE-8F88-08AE255B01A7"] },"name": "default"};
            return policy;
        }
        return null;
    }

}

module.exports.KalturaPlayreadyManager = KalturaPlayreadyManager;
