Oled = require('oled-js');
var oled = new Oled({
        width: 64,
        height : 48});
var pngtolcd = require('png-to-lcd');

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
// prepare font source
fs.createReadStream('public/images/misaki8x8.png')
    .pipe(new PNG())
    .on('parsed', function () {
        var str = kuten2(sourceStr);
        var width = 8;
        var height = 8;
        var subImg = new PNG({"width" : width * sourceStr.length, "height" : height});

        for(var i = 0; i < sourceStr.length; i++){
            var sy = (str[i * 2] - 1) * height;
            var sx = (str[i * 2 + 1] - 1) * width;
            this.bitblt(subImg, sx, sy, width, height, i * width, 0);
        }
        subImg.pack().pipe(fs.createWriteStream('out.png'))
        .on('end', function(){
            pngtolcd('out.png', false, function (err, bitmap) {
                oled.buffer = bitmap
                oled.update();
            });
        });
    });
