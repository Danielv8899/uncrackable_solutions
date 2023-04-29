Java.perform(function(){
    let a = Java.use("sg.vantagepoint.a.a");
    a["a"].implementation = function (bArr, bArr2) {
        let ret = this.a(bArr, bArr2);
        var buf = Java.array('byte', ret);
        var res = "";
        for (var i = 0; i < buf.length; ++i){
            res += (String.fromCharCode(buf[i] & 0xff));
        }
        console.log("flag is: " + res);
        return ret;
    };

    let c = Java.use("sg.vantagepoint.a.c");
c["a"].implementation = function () {
    console.log('a is called');
    return false;
};

c["b"].implementation = function () {
    console.log('b is called');
    return false;
};

c["c"].implementation = function () {
    console.log('c is called');
    return false;
};
})