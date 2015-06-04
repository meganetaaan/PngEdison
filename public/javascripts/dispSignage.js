var Oled = require('oled-js');

var oled = new Oled({
        width: 64,
        height : 48});
oled.clearDisplay();
oled.dimDisplay(true);
var pngtolcd = require('png-to-lcd');
var sleep = require('sleep');

var Iconv = require('iconv').Iconv;
var utf8ToEucjp = new Iconv('UTF-8', 'EUC-JP');
var utf8ToSjis = new Iconv('UTF-8', 'SHIFT-JIS');

var jis = function (str) {
    var i;
    var buf = utf8ToSJis.convert(str);
    return buf;
}

var kuten = function(str){
    var i;
    var buf = utf8ToEucjp.convert(str);
    for(i = 0; i < buf.length; i++){
        buf.set(i, buf.get(i) - 0xA0);
    }
    return buf;
};

var isHalfChar = function (c) {
    var c = ch.charCodeAt(0);
    return c < 256 || (c >= 0xff61 && c <= 0xff9f);
}

var png8x8,
    png4x8;

var strToPng = function (str) {
    if(typeof str != 'string'){
        throw 'IllegalArgumentException';
    }
    var width = 8,
        height = 8;
    var resultImage = new PNG({"width" : width * sourceStr.length, "height" : height});

    var i = 0;
    for(c in str.split('')){
        if (isHalfChar(c)){
        var buf = jis(c);
        png4x8.bitblt(resultImage, buf[1] * width, buf[0] * height, width, height, i * width, 0);
        i += 0.5;
        } else {
        var buf = kuten(c);
        png8x8.bitblt(resultImage, buf[1] * width, buf[0] * height, width, height, i * width, 0);
        i += 1;
    }
    return resultImage;
}

var scrollPng = function (png) {
    png.pack().pipe(fs.createWriteStream('tmp/out.png'))
    .on('close', function(){
        console.log('pngtolcd');
        pngtolcd('tmp/out.png', false, function (err, bitmap) {
            console.log('bitmap');
            var i;
            for(i = 0; i < bitmap.length; i++){
                bitmap[i] = ~bitmap[i];
            }
            console.log(bitmap);
            oled.update();
            var buf = new Buffer(64);
            for(i = 0; i < bitmap.length; i++){
                bitmap.copy(buf, 0, i, i + 64);
                //console.log(buf);
                oled.updatePage(5, buf);
                sleep.usleep(60500);
            }
        });
    })
    .on('error', function(exception){
        console.err(exception);
    });
}

var fs = require('fs'),
PNG = require('node-png').PNG;

pngtolcd('hifive_mini.png', false, function (err, bitmap) {
	oled.buffer = bitmap;
	oled.update();
});

function readPng(path){
    return new Promise(function(resolve){
        fs.createReadStream(path)
        .pipe(new PNG())
        .on('parsed', function(){
            resolve(this);
        });
    });
}

var tasks = [
    readPng('public/images/misaki8x8.png'),
    readPng('public/images/misaki4x8.png')
];

var sourceStr = process.argv[2];
Promise.all(tasks).then(function(results){
    png8x8 = results[0];
    png4x8 = results[1];
    scrollPng(strToPng(sourceStr));
});

/*
// prepare font source
fs.createReadStream('public/images/misaki8x8.png')
    .pipe(new PNG())
    .on('parsed', function () {
	console.log('parsed');
        var str = kuten2(sourceStr);
        var width = 8,
            height = 8;
        var subImg = new PNG({"width" : width * sourceStr.length, "height" : height});
        var i, sy, sx;

        for(i = 0; i < sourceStr.length; i++){
            sy = (str[i * 2] - 1) * height;
            sx = (str[i * 2 + 1] - 1) * width;
            this.bitblt(subImg, sx, sy, width, height, i * width, 0);
        }

	console.log('subImg');
        subImg.pack().pipe(fs.createWriteStream('out.png'))
        .on('close', function(){
	    console.log('pngtolcd');
            pngtolcd('out.png', false, function (err, bitmap) {
		console.log('bitmap');
		for(i = 0; i < bitmap.length; i++){
			bitmap[i] = ~bitmap[i];
		}
		console.log(bitmap);
		oled.update();
		var buf = new Buffer(64);
		for(i = 0; i < bitmap.length; i++){
			bitmap.copy(buf, 0, i, i + 64);
			//console.log(buf);
			oled.updatePage(5, buf);
			sleep.usleep(60500);
		}
            });
        })
	.on('error', function(exception){
		console.err(exception);
	});
    });
*/
