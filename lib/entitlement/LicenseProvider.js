0/**
 * this class is for get the license from fairPlay of apple
 * Created by David.Winder on 6/29/2016.
 */
const fs = require("fs");
const ref = require("ref");
const ffi = require('ffi');
const util = require('util');
require('../utils/KalturaConfig');

/*
var libm = ffi.Library('libm', {
    'ceil': [ 'double', [ 'double' ] ]
});
console.log("ceil in libm is: " + libm.ceil(1.5));

console.log(__dirname);
var libfactorial = ffi.Library('./libfactorial', {
    'factorial': [ 'uint64', [ 'int' ] ]
});
console.log('Your output for factorial: ' + libfactorial.factorial(3));
*/

// typedefs
var intPtr = ref.refType('uint8');
var voidPtr = ref.refType('void *');
var intPtrPtr = ref.refType(intPtr);

var appleLib = ffi.Library('../analyzeSPC', {
    'SKDServerGenCKC': [ 'int', [ intPtr,'int', intPtr, intPtr, intPtr, intPtr, 'int', 'int',
        intPtr, intPtrPtr, intPtr ] ],
    'SKDServerDisposeStorage': [ 'int', [ voidPtr ] ]
});



const Promise = require('bluebird');
class LicenseProvider {
    constructor(mData)
    {
        this._spc = mData.spc;
        this._spc.type = ref.types.uint8;

        this._keyPem = mData.keyPem;
        this._keyPem.type = ref.types.uint8;

        this._key = mData.key;
        this._key.type = ref.types.uint8;
        this._iv = mData.iv;
        this._iv.type = ref.types.int8;
        this._ask = mData.ask;

        /*
        var mData = LicenseProvider.getMockData();

        var spc = mData.spc;
        spc.type = ref.types.uint8;
        var spcLength = spc.length;

        var keyPem = mData.keyPem;
        keyPem.type = ref.types.uint8;
        var keyPemLength = keyPem.length;

        const key = mData.key;
        key.type = ref.types.uint8;
        const iv = mData.iv;
        iv.type = ref.types.int8;
        const ask = mData.ask;

        var duration = 123456;  //int -as the time request max  is 4294967295 for Uint32
        */
        /*
        var buf = new Buffer(4);
        buf.writeInt32LE(0, 0);
        buf.type = ref.types.int;
        console.log(buf.deref());
        console.log(buf.deref());
        var one = buf.ref();
        console.log(one.deref().deref());

        //var porigin = Buffer.alloc(800, 0);
        // var porigin = ref.alloc('uint8', null);
        // console.log("porigin is: ");
        // console.log(porigin);
        // console.log("porigin val: " + porigin.deref());
        // var contentKeyCtx = porigin.ref(); // need to be int**
        // contentKeyCtx.type = intPtrPtr;
        // console.log("contentKeyCtx is: ");
        // console.log(contentKeyCtx);
        */
        /*
        var origin = Buffer.alloc(3000, 0);
        var contentKeyCtx = origin.ref();
        origin = origin.slice(0, 1);
        console.log("origin.size: " + origin.length);
        */
        /*
        //var contentKeyCtx = ref.alloc(intPtr, null);
        //contentKeyCtx.type = intPtrPtr;
        //var contentKeyCtx = ref.alloc(voidPtr, null);
        //var type = ref.coerceType('void *');
        //console.log((type.indirection));
        //var contentKeyCtx = ref.alloc(type, null);
        //console.log(x);
        //contentKeyCtx.type = voidPtrPtr;
        */
        /*
        console.log("contentKeyCtx is: ");
        console.log(contentKeyCtx);
        var contentKeyCtxSize = ref.alloc('int', 2); //set default 2 to not fail
        console.log("before SKDServerGenCKC");
        // use 11 params
        //                     intPtr, int,  intPtr intPtr intPtr intPtr     int      int    intPtr    intPtrPtr        intPtr
        appleLib.SKDServerGenCKC(spc, spcLength, key, iv, ask, keyPem, keyPemLength, duration, null, contentKeyCtx, contentKeyCtxSize);
        console.log("after SKDServerGenCKC");
        var size = contentKeyCtxSize.deref();
        console.log("size: " + size);
        var p = contentKeyCtx.deref();
        console.log("p.size: " + p.length);
        */
        /*
        console.log("p is: ");
        console.log(p);
        console.log("p.size: " + p.length);
        console.log("z[3]: " + p.readUInt8(3, true));
        console.log("zz[10]: " + p.readUInt8(10, true));
        console.log("zz1[10]: " + p.readUInt8(10, true).toString(16));

        console.log("p[0]: " + p[0]);
        console.log("p[1]: " + p[1]);
        console.log("p[2]: " + p[2]);
        console.log("p[3]: " + p[3]);
        console.log("p[10]: " + p[10]);
        */
        /*
        var ckcData = p.slice(0, size);
        p = p.slice(0, 1);

        console.log("ckcData.size: " + ckcData.length);
        console.log("ckcData is: ");
        console.log(ckcData);
        var ckc = "";
        for (var i = 0; i < size; i++) {
            ckc += (ckcData.readUInt8(i).toString(16));
        }


       //fs.writeFileSync('TempCKC.txt', ckc, 'binary');
        //ckc = ckc.toString('base64');
        console.log("ckc: " + ckc);
        //console.log("duration: " + duration);
        this._ret = {ckc, duration};
        */
    }


    static getMockData() {
        var spc = fs.readFileSync("../../tests/spc1.bin");
        var keyPem = fs.readFileSync("../../tests/dev_private_key.pem");
        // static const UInt8 pKeyPem[] = {45,45,45,45,45,66,69,71,73,78,32,82,83,65,32,80,82,73,86,65,84,69,32,75,69,89,45,45,45,45,45,10,77,73,73,67,88,65,73,66,65,65,75,66,103,81,67,48,88,103,69,78,117,76,50,117,106,75,114,115,86,74,68,115,113,49,83,120,78,76,52,51,78,54,55,57,50,116,101,113,112,51,83,105,105,104,105,43,109,110,54,90,68,100,102,99,10,88,80,51,70,115,80,81,78,108,116,66,81,107,105,87,73,74,71,80,111,115,111,82,106,119,68,117,65,83,49,110,116,69,69,113,74,121,99,57,80,66,110,88,104,68,69,116,115,74,111,47,79,52,102,68,121,51,117,109,77,114,118,67,72,10,87,116,52,82,47,114,74,51,79,52,98,57,109,56,86,43,81,67,79,57,104,69,48,107,70,112,82,74,90,77,116,55,82,121,119,109,70,100,114,97,109,48,49,117,65,82,107,71,98,55,120,79,67,51,122,80,114,81,73,68,65,81,65,66,10,65,111,71,66,65,73,79,43,118,107,112,70,106,78,100,52,106,69,105,47,112,72,81,97,50,87,118,117,117,74,111,103,112,69,78,115,110,71,100,99,108,89,99,56,69,56,76,49,109,107,56,49,109,49,121,115,49,47,105,85,118,107,57,71,10,118,55,90,54,97,99,117,57,117,80,82,53,111,78,89,122,122,99,74,121,82,54,99,118,90,83,70,120,116,71,73,90,110,87,78,100,68,79,65,66,55,49,98,43,89,113,77,118,106,51,108,114,54,77,103,85,100,77,85,103,85,102,120,90,10,69,68,88,76,69,104,73,111,86,122,121,81,87,73,116,43,102,54,104,106,83,71,47,104,122,121,119,43,74,103,108,111,52,111,103,67,87,80,115,86,51,83,54,85,71,50,87,66,65,107,69,65,53,72,80,100,100,71,73,85,97,51,52,107,10,50,47,69,71,81,113,121,67,65,111,52,86,89,108,67,85,100,67,70,84,112,57,43,101,70,73,85,101,100,101,113,117,103,115,83,73,90,104,103,98,108,84,43,70,83,118,77,80,89,65,82,117,71,47,121,119,76,111,79,105,118,82,121,49,10,100,70,108,48,100,73,66,49,115,81,74,66,65,77,111,100,121,77,115,107,75,48,114,51,49,50,107,114,111,43,85,82,113,56,86,120,108,119,119,89,48,102,118,50,114,70,49,97,83,48,47,99,108,81,85,119,53,79,72,47,79,120,69,110,10,68,103,122,51,108,51,80,78,84,88,68,67,99,81,68,104,57,119,121,69,90,86,48,83,103,73,112,55,83,89,67,68,114,76,48,67,81,69,111,56,72,69,111,108,86,78,49,90,77,69,69,73,73,84,67,112,80,100,88,50,116,90,119,115,10,56,120,67,74,103,57,87,90,74,74,85,109,98,75,43,69,103,120,67,98,76,72,101,65,102,102,89,82,110,103,54,115,122,79,73,50,106,108,69,112,50,49,90,67,69,67,47,68,108,72,77,113,88,108,48,57,73,81,69,67,81,71,83,110,10,69,111,67,47,111,87,79,122,75,121,52,118,48,109,51,89,76,47,43,105,119,115,76,43,100,85,119,83,71,117,74,101,102,104,84,109,86,55,118,47,68,109,122,82,105,120,118,79,112,68,117,109,55,87,66,53,66,68,67,56,86,69,82,74,10,81,53,117,84,76,49,116,55,82,70,73,121,100,88,99,118,109,56,48,67,81,72,47,69,49,55,109,87,84,54,54,80,80,101,113,108,111,65,102,83,72,47,53,116,74,121,97,107,50,103,97,103,107,117,70,110,77,104,55,55,57,74,82,70,10,114,108,53,89,73,73,105,65,104,43,113,53,68,107,99,106,87,119,54,101,110,105,53,79,52,43,85,117,119,88,82,112,50,57,118,90,97,120,109,68,108,73,69,61,10,45,45,45,45,45,69,78,68,32,82,83,65,32,80,82,73,86,65,84,69,32,75,69,89,45,45,45,45,45,10};

        //key
        //const key = Buffer.alloc(16, 0);
        //const key = Buffer.from([0x92 , 0x66, 0x48, 0xb9, 0x86, 0x1e, 0xc0, 0x47, 0x1b, 0xa2, 0x17, 0x58, 0x85, 0x1c, 0x3d, 0xda]);
        const key = Buffer.from([0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C,0x3C]);
        //iv
        //const iv = Buffer.alloc(16, 0);
        //const iv = Buffer.from([0x5d , 0x16, 0x44, 0xea, 0xec, 0x11, 0xf9, 0x83, 0x14, 0x75, 0x41, 0xe4, 0x6e, 0xeb, 0x27, 0x74]);
        const iv = Buffer.from([0xD5,0xFB,0xD6,0xB8,0x2E,0xD9,0x3E,0x4E,0xF9,0x8A,0xE4,0x09,0x31,0xEE,0x33,0xB7]);

        //var ask = d87ce7a2 6081de2e 8eb8acef 3a6dc179;
        const ask = Buffer.from([0xd8 , 0x7c, 0xe7, 0xa2, 0x60, 0x81, 0xde, 0x2e, 0x8e, 0xb8, 0xac, 0xef, 0x3a, 0x6d, 0xc1, 0x79]);
        /*
         UInt8 ask[16];
        ask[0] = 0X2D;
        ask[1] = 0X96;
        ask[2] = 0XC0;
        ask[3] = 0Xa3;
        ask[4] = 0X01;
        ask[5] = 0X8e;
        ask[6] = 0X6f;
        ask[7] = 0X9c;
        ask[8] = 0X5b;
        ask[9] = 0Xb3;
        ask[10] = 0X1d;
        ask[11] = 0X69;
        ask[12] = 0X1f;
        ask[13] = 0Xd0;
        ask[14] = 0Xdb;
        ask[15] = 0Xe4;

        */

        return {spc, keyPem, key, iv, ask};
    }



    getResponse(duration)
    {
        let This = this;
        return new Promise(function(resolve,reject)
        {
            try {
                // alloc place to uint8** as contentKeyCtx
                var origin = Buffer.alloc(3000, 0);
                var contentKeyCtx = origin.ref();
                origin = origin.slice(0, 1);
                // alloc place to size of answer - set default as 0
                var contentKeyCtxSize = ref.alloc('int', 0);

                console.log("before SKDServerGenCKC");
                appleLib.SKDServerGenCKC(This._spc, This._spc.length, This._key, This._iv, This._ask, This._keyPem, This._keyPem.length, duration, null, contentKeyCtx, contentKeyCtxSize);
                console.log("after SKDServerGenCKC");

                var size = contentKeyCtxSize.deref();
                console.log("size: " + size);
                var p = contentKeyCtx.deref();

                const ckcData = Buffer.allocUnsafe(size); //faster but no init
                var ckc = ""; //also get the ckc as string for debug
                for (var i = 0; i < size; i++) {
                    ckcData[i] = p[i];
                    ckc += (ckcData.readUInt8(i).toString(16));
                }
                    ckcData[i] = p[i];
                // write to file as binary buffer
                fs.writeFileSync('ckcTest.bin', ckcData, 'binary');

                console.log("ckcData is: ");
                console.log(ckcData);
                console.log("ckc: " + ckc);

                //deleting the memory alloc in SKDServerGenCKC after copy to node buffer
                appleLib.SKDServerDisposeStorage(p);
                var ret = {"status":"OK", "license":ckcData, "duration":duration};
                resolve(ret);
            } catch (err) {
                reject(err);
            }
        });
    }
}




module.exports = LicenseProvider;
