//overcomplicated solution for practice reasons, key is plaintext on bss section of native lib

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
    Interceptor.attach(Module.findExportByName("libfoo.so","Java_sg_vantagepoint_uncrackable2_CodeCheck_bar"), {
        onEnter: function(){
            var base = Module.getBaseAddress("libfoo.so");
            var addr = base.add(0x4008);
            var val = Memory.readByteArray(addr,1);
            var valA = new Uint8Array(val);
            console.log("goofy byte val: " + valA[0]);
            return 1;
        },
        onLeave: function(retval){
            console.log("check returned: " + retval);
            retval.replace(1);
        }
    });
})
.catch(error => {
    console.error("error waiting for module: ", error);
})

const strncmpPtr = Module.findExportByName(null, 'strncmp');
const strncmp = new NativeFunction(strncmpPtr, 'int', ['pointer', 'pointer', 'int']);

Interceptor.attach(strncmpPtr, {
    onEnter: function(args){
        try{
        const str1 = Memory.readUtf8String(args[0], Number(args[2]));
        const str2 = Memory.readUtf8String(args[1], Number(args[2]));
        console.log('strncmp: ', str1, str2, args[2]);
        }
        catch {
            console.log('strncmp called with nonstring args:', args[0], args[1], args[2]);
        }
    }
});


Java.perform(function(){

    let CodeCheck = Java.use("sg.vantagepoint.uncrackable2.CodeCheck");
CodeCheck["bar"].implementation = function (str) {
    console.log('bar is called, str: ' + str);
    let ret = this.bar(str);
    console.log('bar ret value is ' + ret);
    return ret;
};

    let b = Java.use("sg.vantagepoint.a.b");
b["a"].implementation = function () {
    console.log('a is called');
    return false;
};

b["b"].implementation = function () {
    console.log('b is called');
    return false;
};

b["c"].implementation = function () {
    console.log('c is called');
    return false;
};
})