//statically patched 0x3180 to return instantly bypassing the pthread call

function waitForModule(name) {
    return new Promise((resolve,reject) => {
        const checkModule = () => {
            const modules = Process.enumerateModules();
            const module = modules.find(m => m.name === name);
            if (module){
                resolve(module);
            } else {
                setTimeout(checkModule, 100);
            }
        };
        checkModule();
    })
}

waitForModule('libfoo.so')
.then(module => {
    console.log("Module loaded: ", module.name);


    
    var base = Module.getBaseAddress("libfoo.so");
    var check = base.add(0x6038);
    var checkFunc = base.add(0x33b0);
    var xorkey = base.add(0x601c);
    var enc = base.add(0xfa0);
    Interceptor.attach(checkFunc, {
        onEnter: function(args){
            console.log("check called");
            Memory.writeByteArray(check,[0x2],1);
            var val = Memory.readByteArray(check,1);
            var valA = new Uint8Array(val);
            console.log("check val: " + valA);
        }
    });
    Interceptor.attach(enc, {
        onEnter: function(args){
            console.log("fa0 called");
        },
        onLeave: function(retval){
            var enckey = Memory.readByteArray(retval,24);
            var enckeyA = new Uint8Array(enckey);
            console.log("enckey: " + enckey);
            var xor = Memory.readUtf8String(xorkey,24);
            console.log("xor key: " + xor);
            
            var decodedKey = "";
            for (var i = 0; i < 24; i++) {
                decodedKey += String.fromCharCode(enckeyA[i] ^ xor.charCodeAt(i % xor.length));
            }
            console.log("decoded key: " + decodedKey);
        }
    })
    });


Java.perform(function(){

let RootDetection = Java.use("sg.vantagepoint.util.RootDetection");
RootDetection["checkRoot1"].implementation = function () {
    console.log('checkRoot1 is called');
    return false;
};

RootDetection["checkRoot2"].implementation = function () {
    console.log('checkRoot2 is called');
    return false;
};

RootDetection["checkRoot3"].implementation = function () {
    console.log('checkRoot3 is called');
    return false;
};

let IntegrityCheck = Java.use("sg.vantagepoint.util.IntegrityCheck");
IntegrityCheck["isDebuggable"].implementation = function (context) {
    console.log('isDebuggable is called' + ', ' + 'context: ' + context);
    return false;
};

let MainActivity = Java.use("sg.vantagepoint.uncrackable3.MainActivity");
MainActivity["verifyLibs"].implementation = function () {
    console.log('verifyLibs is called');
    return;
};

})
