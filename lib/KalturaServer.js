
var os = require('os');
var fs = require('fs');
var url = require('url');
var path = require('path');
var mime = require('mime');
var util = require('util');
var http = require('http');
var https = require('https');
var cluster = require('cluster');
var querystring = require('querystring');

require('./utils/KalturaCouchbaseConnector');

var kaltura = module.exports = require('./KalturaBase');

var KalturaServer = function(){
};
util.inherits(KalturaServer, kaltura.KalturaBase);

KalturaServer.prototype.hostname = os.hostname();
KalturaServer.prototype.httpWebServer = null;
KalturaServer.prototype.httpsWebServer = null;
KalturaServer.prototype.processesToRestore = null;



KalturaServer.prototype.init = function() {
	this.startWebServers();
	KalturaCouchbaseConnector.init();
	try {
		this.DEBUG_ENABLED = KalturaConfig.config.bin.debug.enabled;
		this.DEBUG_PORT = parseInt(KalturaConfig.config.bin.debug.port);
	} catch (ex) {
		this.DEBUG_ENABLED = 'false';
	}
};

KalturaServer.prototype.startWebServers = function() {
    if((typeof KalturaConfig.config.cloud) != 'undefined'){
    	if(!KalturaConfig.config.cloud.keyFilePath || !KalturaConfig.config.cloud.certFilePath){
    		KalturaLogger.log('Unable to locate keyFilePath || certFilePath in the configuration file. Https listener will not be created');
    		return;
    	}
    	var keyFilePath = KalturaConfig.config.cloud.keyFilePath;
    	var certFielPath = KalturaConfig.config.cloud.certFilePath;
    	
    	var options = {
    			  key: fs.readFileSync(keyFilePath),
    			  cert: fs.readFileSync(certFielPath)
    	};
    }
};

KalturaServer.prototype.isDebugEnabled = function(){
	return this.DEBUG_ENABLED == 'true';
};


var KalturaMainProcess = function(){
	KalturaLogger.log('\n\n_____________________________________________________________________________________________');
	KalturaLogger.log('KalturaServer started');
	
	this.init();
	this.run = true;
	this.childProcesses = {};
	
	cluster.setupMaster({
		args: [JSON.stringify(KalturaConfig.config)]
	});
	
	this.start();
	
	var This = this;
	
	cluster.on('listening', function(worker, address) {
		KalturaLogger.log('A process [' + worker.process.pid + '] is now connected, processes to restore [' + JSON.stringify(This.processesToRestore) + ']');
		if(This.processesToRestore){
			var processes = This.processesToRestore;
			This.processesToRestore = null;
		}		
	});
	process.on('SIGUSR1', function() {
		KalturaLogger.log('Got SIGUSR1. Invoke log rotate notification.');
		This.notifyLogsRotate();
	});
		
	KalturaConfig.watchFiles(function(){
		This.restart();
	});
};
util.inherits(KalturaMainProcess, KalturaServer);

KalturaMainProcess.prototype.start = function(){
	KalturaLogger.log('Starting all child processes');
	this.run = true;
	
	var numOfCores = os.cpus().length;
	if(this.isDebugEnabled()) {
		numOfCores = 1; // at this point we can debug only one node js
	}
	var processes = [process.pid];
	for (var i = 0; i < numOfCores; i++) {
		var childProcess = this.spawn();
		processes.push(childProcess.process.pid);
		KalturaLogger.log('Started process [' + childProcess.process.pid + ']');
	}
};

KalturaMainProcess.prototype.spawn = function(){
	if(this.isDebugEnabled()) {
		if ( process.execArgv.length != 0 ){
			var lastArg = process.execArgv.pop();
			if (lastArg && (typeof lastArg !== 'undefined') && lastArg.indexOf('--debug=')==-1)
				process.execArgv.push(lastArg);
		}
		process.execArgv.push('--debug=' + this.DEBUG_PORT++);
	}
	var childProcess = cluster.fork();
	var This = this;
	childProcess.on('exit', function(code){
		This.onProcessExit(childProcess, code);
	});
	this.childProcesses[childProcess.process.pid] = childProcess;
	
	return childProcess;
};

KalturaMainProcess.prototype.onProcessExit = function(childProcess, code){
	var pid = childProcess.process.pid;
	delete this.childProcesses[pid];
	KalturaLogger.log('Process died [' + pid + '] , code [' + code + ']');
	
	if(this.run){
		var childProcess = this.spawn();
		KalturaLogger.log('Restarted process [' + childProcess.process.pid + ']');

		var processes = [];
		for (var pid in this.childProcesses) {
			processes.push(pid);
		}
	}
};

KalturaMainProcess.prototype.stop = function() {
	KalturaLogger.log('Stopping all child processes');
	this.run = false;
	for ( var pid in this.childProcesses) {
		this.childProcesses[pid].send('stop');
	}
};

KalturaMainProcess.prototype.restart = function() {
	KalturaLogger.log('Restarting all child processes');
	this.stop();
	this.start();
};

KalturaMainProcess.prototype.notifyLogsRotate = function() {
	KalturaLogger.log('Log rotate main process');
	KalturaLogger.notifyLogsRotate();
	for ( var pid in this.childProcesses) {
		KalturaLogger.log('Log rotate child process [' + pid + ']');
		this.childProcesses[pid].send('notifyLogsRotate');
	}
};

var KalturaChildProcess = function(){
	process.on('uncaughtException', function (err) {
	    KalturaLogger.error('Uncaught Exception: ' + err.stack);
	}); 

	var This = this;
	process.on('message', function(action) {
		if(typeof This[action] === 'function'){
			This[action].apply(This);
		}
	});
	  
	this.init();
	this.managers = {};
	this.start();
};
util.inherits(KalturaChildProcess, KalturaServer);

KalturaChildProcess.prototype.start = function(){
	var express = require('express');
	var httpApp = this.startHttpServer(express);
	this.configureExpressApp(httpApp);
	if(this.httpsWebServer){
		var httpsApp = this.startHttpsServer(express);
		this.configureExpressApp(httpsApp);
	}
};

KalturaChildProcess.prototype.startHttpServer = function(express) {
	var httpPort = KalturaConfig.config.cloud.httpPort;
	KalturaLogger.log('Listening on port [' + httpPort + ']');

	var app = express();
	app.listen(httpPort);
	return app;
};

KalturaChildProcess.prototype.startHttpsServer = function(express) {
	var httpsPort = KalturaConfig.config.cloud.httpsPort;
	KalturaLogger.log('Listening on port [' + httpsPort + ']');
	var app = express();
	app.listen(httpsPort);
	return app;
};

KalturaChildProcess.prototype.stop = function(){
	for(var serviceName in this.managers){
		var service = this.managers[serviceName];
		KalturaLogger.log('Stopping service [' + serviceName + ']');
		service.stop();
	}
};

KalturaChildProcess.prototype.notifyLogsRotate = function(){
	KalturaLogger.notifyLogsRotate();
};


KalturaChildProcess.prototype.configureExpressApp = function(app)
{
	var bodyParser = require('body-parser');
	//app.use(bodyParser.json()); // for parsing application/json
	app.use(bodyParser.json({
		verify:function(req,res,body){
			req.rawBody = body.toString();
		}
	}));
	//app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({extended:true,
		verify:function(req,res,body){
			req.rawBody = body.toString();
		}
	}));
	
	app.post('/cenc/encryption', handleCencEncryptionRequest);
}

var handleCencEncryptionRequest = function(request, response)
{
	var module = require('./managers/KalturaWidevineManager');
	service = new module['KalturaWidevineManager']();
	service.encryption(request, response);
}

KalturaChildProcess.prototype.parseUrl = function(urlInfo) {
	var pathParts = urlInfo.pathname.split('/');
	if(pathParts.length < 5)
		return null;

	urlInfo.service = pathParts[3][0].toUpperCase() + pathParts[3].substr(1);
	urlInfo.action = pathParts[4];
	urlInfo.params = querystring.parse(urlInfo.query);
	urlInfo.params.partnerId = pathParts[2];
	
	var paramName = null;
	for(var i = 5; i < pathParts.length; i++){
		if(paramName == null){
			paramName = pathParts[i];
		}
		else{
			urlInfo.params[paramName] = pathParts[i];
			paramName = null;
		}
	}
	
	return urlInfo;
};

KalturaChildProcess.prototype.handleRequest = function(request, response) {
    //TODO: Figure out how to unit test this.
    //KalturaLogger.debug("@@NA request ["+ JSON.stringify(request) + " response " + JSON.stringify(response));
    KalturaLogger.access(request, response);
	
	var urlInfo = url.parse(request.url);
	var requestInfo = this.parseUrl(urlInfo);
	//if(!requestInfo){//TODO: We need a better way to decide if this is a static file request.
	//	//KalturaLogger.log("@@NA4 here");
	//	var filePath = path.join(__dirname, 'web', urlInfo.pathname);
	//	var stat = fs.statSync(filePath);
	//	if(stat && stat.isFile()){
	//		response.writeHead(200, {
	//	        'Content-Type': mime.lookup(filePath),
	//	        'Content-Length': stat.size
	//	    });
    //
	//	    var readStream = fs.createReadStream(filePath);
	//	    return readStream.pipe(response);
	//	}
	//		
	//	response.error('Failed to parse request');
	//	return this.errorFileNotFound(response);
	//}

    var service = this.managers[requestInfo.service];
	if(!service){	
		var serviceClass = 'Kaltura' + requestInfo.service + 'Manager';
		var serviceModule = './managers/' + serviceClass;
		try{
			var module = require(serviceModule);
			service = new module[serviceClass]();
		}
		catch(err){
			response.error(err.stack);
			return this.errorFileNotFound(response);
		}

		if(!service){
			response.error('Service [' + requestInfo.service + '] not found');
			return this.errorFileNotFound(response);
		}
		
		service.start();
		this.managers[requestInfo.service] = service;
	}
	if(!service[requestInfo.action] || !(typeof service[requestInfo.action] === 'function')){
		response.error('Action [' + requestInfo.service + '.' + requestInfo.action + '] not found');
		return this.errorFileNotFound(response);
	}

	try{
		if (request.method == 'POST') {
			var postData = '';
			request.on('data', function (data) {
				postData += data;
			});
			request.on('end', function () {
				service[requestInfo.action].apply(service, [request, response, requestInfo.params, postData]);
			});
		}
		else
		{
			service[requestInfo.action].apply(service, [request, response, requestInfo.params, ""]);
		}
	}
	catch(err){
		response.error(err.stack);
		return this.errorResponse(response, 500, err.message);
	}
};

module.exports.KalturaMainProcess = KalturaMainProcess;
module.exports.KalturaChildProcess = KalturaChildProcess;