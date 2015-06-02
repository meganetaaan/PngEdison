var Oled = require('oled-js');

var oled = new Oled({
        width: 64,
        height : 48});
oled.clearDisplay();
oled.dimDisplay(true);
var pngtolcd = require('png-to-lcd');
var sleep = require('sleep');

var sourceStr = process.argv[2];
var Iconv = require('iconv').Iconv;
var iconv = new Iconv('UTF-8', 'EUC-JP');
var kuten2 = function(str){
    var i;
    var buf = iconv.convert(str);
    for(i = 0; i < buf.length; i++){
        buf.set(i, buf.get(i) - 0xA0);
    }
    return buf;
};

var fs = require('fs'),
PNG = require('node-png').PNG;

pngtolcd('hifive_mini.png', false, function (err, bitmap) {
	oled.buffer = bitmap;
	oled.update();
});

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
