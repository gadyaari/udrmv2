// ===================================================================================================
//                           _  __     _ _
//                          | |/ /__ _| | |_ _  _ _ _ __ _
//                          | ' </ _` | |  _| || | '_/ _` |
//                          |_|\_\__,_|_|\__|\_,_|_| \__,_|
//
// This file is part of the Kaltura Collaborative Media Suite which allows users
// to do with audio, video, and animation what Wiki platfroms allow them to do with
// text.
//
// Copyright (C) 2006-2016  Kaltura Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// @ignore
// ===================================================================================================
var util = require('util');
var kaltura = require('./KalturaClientBase');

/**
 *Class definition for the Kaltura service: baseEntry.
 * The available service actions:
 * @action add Generic add entry, should be used when the uploaded entry type is not known.
 * @action addContent Attach content resource to entry in status NO_MEDIA.
 * @action addFromUploadedFile Generic add entry using an uploaded file, should be used when the uploaded entry type is not known.
 * @action get Get base entry by ID.
 * @action getRemotePaths Get remote storage existing paths for the asset.
 * @action update Update base entry. Only the properties that were set will be updated.
 * @action updateContent Update the content resource associated with the entry.
 * @action getByIds Get an array of KalturaBaseEntry objects by a comma-separated list of ids.
 * @action delete Delete an entry.
 * @action list List base entries by filter with paging support.
 * @action listByReferenceId List base entries by filter according to reference id.
 * @action count Count base entries by filter.
 * @action upload Upload a file to Kaltura, that can be used to create an entry.
 * @action updateThumbnailJpeg Update entry thumbnail using a raw jpeg file.
 * @action updateThumbnailFromUrl Update entry thumbnail using url.
 * @action updateThumbnailFromSourceEntry Update entry thumbnail from a different entry by a specified time offset (in seconds).
 * @action flag Flag inappropriate entry for moderation.
 * @action reject Reject the entry and mark the pending flags (if any) as moderated (this will make the entry non-playable).
 * @action approve Approve the entry and mark the pending flags (if any) as moderated (this will make the entry playable).
 * @action listFlags List all pending flags for the entry.
 * @action anonymousRank Anonymously rank an entry, no validation is done on duplicate rankings.
 * @action getContextData This action delivers entry-related data, based on the user's context: access control, restriction, playback format and storage information.
 * @action export .
 * @action index Index an entry by id.
 * @action clone Clone an entry with optional attributes to apply to the clone.
 */
function KalturaBaseEntryService(client){
	KalturaBaseEntryService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaBaseEntryService, kaltura.KalturaServiceBase);
module.exports.KalturaBaseEntryService = KalturaBaseEntryService;

/**
 * Generic add entry, should be used when the uploaded entry type is not known.
 * @param entry KalturaBaseEntry  (optional).
 * @param type string  (optional, enum: KalturaEntryType, default: null).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.add = function(callback, entry, type){
	if(!type){
		type = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entry', kaltura.toParams(entry));
	this.client.addParam(kparams, 'type', type);
	this.client.queueServiceActionCall('baseentry', 'add', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Attach content resource to entry in status NO_MEDIA.
 * @param entryId string  (optional).
 * @param resource KalturaResource  (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.addContent = function(callback, entryId, resource){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'resource', kaltura.toParams(resource));
	this.client.queueServiceActionCall('baseentry', 'addContent', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Generic add entry using an uploaded file, should be used when the uploaded entry type is not known.
 * @param entry KalturaBaseEntry  (optional).
 * @param uploadTokenId string  (optional).
 * @param type string  (optional, enum: KalturaEntryType, default: null).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.addFromUploadedFile = function(callback, entry, uploadTokenId, type){
	if(!type){
		type = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entry', kaltura.toParams(entry));
	this.client.addParam(kparams, 'uploadTokenId', uploadTokenId);
	this.client.addParam(kparams, 'type', type);
	this.client.queueServiceActionCall('baseentry', 'addFromUploadedFile', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Get base entry by ID.
 * @param entryId string Entry id (optional).
 * @param version int Desired version of the data (optional, default: -1).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.get = function(callback, entryId, version){
	if(!version){
		version = -1;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'version', version);
	this.client.queueServiceActionCall('baseentry', 'get', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Get remote storage existing paths for the asset.
 * @param entryId string  (optional).
 * @return KalturaRemotePathListResponse.
 */
KalturaBaseEntryService.prototype.getRemotePaths = function(callback, entryId){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.queueServiceActionCall('baseentry', 'getRemotePaths', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Update base entry. Only the properties that were set will be updated.
 * @param entryId string Entry id to update (optional).
 * @param baseEntry KalturaBaseEntry Base entry metadata to update (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.update = function(callback, entryId, baseEntry){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'baseEntry', kaltura.toParams(baseEntry));
	this.client.queueServiceActionCall('baseentry', 'update', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Update the content resource associated with the entry.
 * @param entryId string Entry id to update (optional).
 * @param resource KalturaResource Resource to be used to replace entry content (optional).
 * @param conversionProfileId int The conversion profile id to be used on the entry (optional, default: null).
 * @param advancedOptions KalturaEntryReplacementOptions Additional update content options (optional, default: null).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.updateContent = function(callback, entryId, resource, conversionProfileId, advancedOptions){
	if(!conversionProfileId){
		conversionProfileId = null;
	}
	if(!advancedOptions){
		advancedOptions = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'resource', kaltura.toParams(resource));
	this.client.addParam(kparams, 'conversionProfileId', conversionProfileId);
	if (advancedOptions !== null){
		this.client.addParam(kparams, 'advancedOptions', kaltura.toParams(advancedOptions));
	}
	this.client.queueServiceActionCall('baseentry', 'updateContent', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Get an array of KalturaBaseEntry objects by a comma-separated list of ids.
 * @param entryIds string Comma separated string of entry ids (optional).
 * @return array.
 */
KalturaBaseEntryService.prototype.getByIds = function(callback, entryIds){
	var kparams = {};
	this.client.addParam(kparams, 'entryIds', entryIds);
	this.client.queueServiceActionCall('baseentry', 'getByIds', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Delete an entry.
 * @param entryId string Entry id to delete (optional).
 * @return .
 */
KalturaBaseEntryService.prototype.deleteAction = function(callback, entryId){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.queueServiceActionCall('baseentry', 'delete', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * List base entries by filter with paging support.
 * @param filter KalturaBaseEntryFilter Entry filter (optional, default: null).
 * @param pager KalturaFilterPager Pager (optional, default: null).
 * @return KalturaBaseEntryListResponse.
 */
KalturaBaseEntryService.prototype.listAction = function(callback, filter, pager){
	if(!filter){
		filter = null;
	}
	if(!pager){
		pager = null;
	}
	var kparams = {};
	if (filter !== null){
		this.client.addParam(kparams, 'filter', kaltura.toParams(filter));
	}
	if (pager !== null){
		this.client.addParam(kparams, 'pager', kaltura.toParams(pager));
	}
	this.client.queueServiceActionCall('baseentry', 'list', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * List base entries by filter according to reference id.
 * @param refId string Entry Reference ID (optional).
 * @param pager KalturaFilterPager Pager (optional, default: null).
 * @return KalturaBaseEntryListResponse.
 */
KalturaBaseEntryService.prototype.listByReferenceId = function(callback, refId, pager){
	if(!pager){
		pager = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'refId', refId);
	if (pager !== null){
		this.client.addParam(kparams, 'pager', kaltura.toParams(pager));
	}
	this.client.queueServiceActionCall('baseentry', 'listByReferenceId', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Count base entries by filter.
 * @param filter KalturaBaseEntryFilter Entry filter (optional, default: null).
 * @return int.
 */
KalturaBaseEntryService.prototype.count = function(callback, filter){
	if(!filter){
		filter = null;
	}
	var kparams = {};
	if (filter !== null){
		this.client.addParam(kparams, 'filter', kaltura.toParams(filter));
	}
	this.client.queueServiceActionCall('baseentry', 'count', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Upload a file to Kaltura, that can be used to create an entry.
 * @param fileData file The file data (optional).
 * @return string.
 */
KalturaBaseEntryService.prototype.upload = function(callback, fileData){
	var kparams = {};
	var kfiles = {};
	this.client.addParam(kfiles, 'fileData', fileData);
	this.client.queueServiceActionCall('baseentry', 'upload', kparams, kfiles);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Update entry thumbnail using a raw jpeg file.
 * @param entryId string Media entry id (optional).
 * @param fileData file Jpeg file data (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.updateThumbnailJpeg = function(callback, entryId, fileData){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	var kfiles = {};
	this.client.addParam(kfiles, 'fileData', fileData);
	this.client.queueServiceActionCall('baseentry', 'updateThumbnailJpeg', kparams, kfiles);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Update entry thumbnail using url.
 * @param entryId string Media entry id (optional).
 * @param url string file url (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.updateThumbnailFromUrl = function(callback, entryId, url){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'url', url);
	this.client.queueServiceActionCall('baseentry', 'updateThumbnailFromUrl', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Update entry thumbnail from a different entry by a specified time offset (in seconds).
 * @param entryId string Media entry id (optional).
 * @param sourceEntryId string Media entry id (optional).
 * @param timeOffset int Time offset (in seconds) (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.updateThumbnailFromSourceEntry = function(callback, entryId, sourceEntryId, timeOffset){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'sourceEntryId', sourceEntryId);
	this.client.addParam(kparams, 'timeOffset', timeOffset);
	this.client.queueServiceActionCall('baseentry', 'updateThumbnailFromSourceEntry', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Flag inappropriate entry for moderation.
 * @param moderationFlag KalturaModerationFlag  (optional).
 * @return .
 */
KalturaBaseEntryService.prototype.flag = function(callback, moderationFlag){
	var kparams = {};
	this.client.addParam(kparams, 'moderationFlag', kaltura.toParams(moderationFlag));
	this.client.queueServiceActionCall('baseentry', 'flag', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Reject the entry and mark the pending flags (if any) as moderated (this will make the entry non-playable).
 * @param entryId string  (optional).
 * @return .
 */
KalturaBaseEntryService.prototype.reject = function(callback, entryId){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.queueServiceActionCall('baseentry', 'reject', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Approve the entry and mark the pending flags (if any) as moderated (this will make the entry playable).
 * @param entryId string  (optional).
 * @return .
 */
KalturaBaseEntryService.prototype.approve = function(callback, entryId){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.queueServiceActionCall('baseentry', 'approve', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * List all pending flags for the entry.
 * @param entryId string  (optional).
 * @param pager KalturaFilterPager  (optional, default: null).
 * @return KalturaModerationFlagListResponse.
 */
KalturaBaseEntryService.prototype.listFlags = function(callback, entryId, pager){
	if(!pager){
		pager = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	if (pager !== null){
		this.client.addParam(kparams, 'pager', kaltura.toParams(pager));
	}
	this.client.queueServiceActionCall('baseentry', 'listFlags', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Anonymously rank an entry, no validation is done on duplicate rankings.
 * @param entryId string  (optional).
 * @param rank int  (optional).
 * @return .
 */
KalturaBaseEntryService.prototype.anonymousRank = function(callback, entryId, rank){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'rank', rank);
	this.client.queueServiceActionCall('baseentry', 'anonymousRank', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * This action delivers entry-related data, based on the user's context: access control, restriction, playback format and storage information.
 * @param entryId string  (optional).
 * @param contextDataParams KalturaEntryContextDataParams  (optional).
 * @return KalturaEntryContextDataResult.
 */
KalturaBaseEntryService.prototype.getContextData = function(callback, entryId, contextDataParams){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'contextDataParams', kaltura.toParams(contextDataParams));
	this.client.queueServiceActionCall('baseentry', 'getContextData', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * .
 * @param entryId string  (optional).
 * @param storageProfileId int  (optional).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.exportAction = function(callback, entryId, storageProfileId){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'storageProfileId', storageProfileId);
	this.client.queueServiceActionCall('baseentry', 'export', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Index an entry by id.
 * @param id string  (optional).
 * @param shouldUpdate bool  (optional, default: true).
 * @return int.
 */
KalturaBaseEntryService.prototype.index = function(callback, id, shouldUpdate){
	if(!shouldUpdate){
		shouldUpdate = true;
	}
	var kparams = {};
	this.client.addParam(kparams, 'id', id);
	this.client.addParam(kparams, 'shouldUpdate', shouldUpdate);
	this.client.queueServiceActionCall('baseentry', 'index', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};
/**
 * Clone an entry with optional attributes to apply to the clone.
 * @param entryId string Id of entry to clone (optional).
 * @param cloneOptions array  (optional, default: null).
 * @return KalturaBaseEntry.
 */
KalturaBaseEntryService.prototype.cloneAction = function(callback, entryId, cloneOptions){
	if(!cloneOptions){
		cloneOptions = null;
	}
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	if(cloneOptions !== null){
	for(var index in cloneOptions)
	{
		var obj = cloneOptions[index];
		this.client.addParam(kparams, 'cloneOptions:' + index, kaltura.toParams(obj));
	}
	}
	this.client.queueServiceActionCall('baseentry', 'clone', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

/**
 *Class definition for the Kaltura service: drmLicenseAccess.
 * The available service actions:
 * @action getAccess getAccessAction
 * input: flavor ids, drmProvider
 * Get Access Action.
 */
function KalturaDrmLicenseAccessService(client){
	KalturaDrmLicenseAccessService.super_.call(this);
	this.init(client);
}

util.inherits(KalturaDrmLicenseAccessService, kaltura.KalturaServiceBase);
module.exports.KalturaDrmLicenseAccessService = KalturaDrmLicenseAccessService;

/**
 * getAccessAction
 * input: flavor ids, drmProvider
 * Get Access Action.
 * @param entryId string  (optional).
 * @param flavorIds string  (optional).
 * @param referrer string  (optional).
 * @return KalturaDrmLicenseAccessDetails.
 */
KalturaDrmLicenseAccessService.prototype.getAccess = function(callback, entryId, flavorIds, referrer){
	var kparams = {};
	this.client.addParam(kparams, 'entryId', entryId);
	this.client.addParam(kparams, 'flavorIds', flavorIds);
	this.client.addParam(kparams, 'referrer', referrer);
	this.client.queueServiceActionCall('drm_drmlicenseaccess', 'getAccess', kparams);
	if (!this.client.isMultiRequest()){
		this.client.doQueue(callback);
	}
};

