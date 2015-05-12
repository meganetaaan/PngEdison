var pngtolcd = require('png-to-lcd');
Oled = require('oled-js');

var opts = {
	width : 64,
	height : 48
};

var pictureDir = 'res/picture/'
var pngFile = process.argv.length > 2 ? process.argv[2] : 'chicken.png';

var oled = new Oled(opts);
oled.clearDisplay();
pngtolcd( pictureDir + pngFile, false, function(err, bitmap) {
  oled.buffer = bitmap;
  oled.update();
});