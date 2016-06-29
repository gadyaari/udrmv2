/**
 * this class is for get the license from fairPlay of apple
 * Created by David.Winder on 6/29/2016.
 */

var ffi = require('ffi');


var libm = ffi.Library('libm', {
    'ceil': [ 'double', [ 'double' ] ]
});
console.log("ceil in libm is: " + libm.ceil(1.5));


var libfactorial = ffi.Library('./libfactorial', {
    'factorial': [ 'uint64', [ 'int' ] ]
});
console.log('Your output for factorial: ' + libfactorial.factorial(3));


/*
var appleLib = ffi.Library('../analyzeSPC', {
    'SKDServerGenCKC': [ 'OSStatus', [ 'const UInt8 *','UInt32', 'UInt8', 'UInt8', 'UInt8', 'UInt8', 'UInt8', 'UInt32',
    'UInt32', 'const UInt8 *', 'UInt8 **', 'UInt32 *' ] ]
});

*/


const Promise = require('bluebird');
class LicenseProvider {
    constructor()
    {

    }
    get_response()
    {
        let This = this;
        return new Promise(function(resolve,reject)
        {
            var mock = {"status":"OK", "license":12345};
            resolve(mock);
            //reject("NO GO");
        });
    }
}




module.exports = LicenseProvider;
