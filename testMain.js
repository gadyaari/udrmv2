console.log("Starting");
console.log("Hello World");


var cluster = require('cluster');
var kaltura = require('./lib/KalturaServer');

var KalturaProcess = null;

if (cluster.isMaster) {
    KalturaProcess = new kaltura.KalturaMainProcess();
}
else{
    KalturaProcess = new kaltura.KalturaChildProcess();
}

//var kaltura = require('./lib/KalturaServer');
//var KalturaProcess = null;
//KalturaProcess = new kaltura.KalturaMainProcess();

var a = "Finsihed";
console.log(a);