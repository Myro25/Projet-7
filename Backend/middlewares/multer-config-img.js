// Dans multer-config-img.js

const multer = require('multer');

const storage = multer.memoryStorage();

module.exports = multer({ storage }).single('image');
