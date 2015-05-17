var express = require('express');
var router = express.Router();

Oled = require('oled-js');
var oled = new Oled({
width : 64,
height : 48});

/* GET home page. */
router.get('/', function(req, res){
    res.send('hello world');
});

router.get('/disp/bitmap/', function (req, res) {
    var bmpStr = req.param('bmpstr', '0101010101010101');
    var bmpArr = bmpStr.split('');
    for(var i = 0; i < bmpArr.length; i++){
        bmpArr[i] = bmpArr[i] == '0' ? 'BLACK' : 'WHITE';
    }
    oled.drawBitmap(bmpArr);
});

module.exports = router;
