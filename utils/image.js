const sharp = require('sharp');

const processImage = (height = 300, width = 200, src) => 
    sharp(src).resize(parseInt(height), parseInt(width)).toBuffer();

module.exports = {
    processImage,
}