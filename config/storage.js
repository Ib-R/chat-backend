const path = require("path"),
    multer = require("multer");

// Set storage engine
const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function(req, file, cb) {
        cb(
            null,
            `${file.originalname}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

// Init upload
const uploader = multer({storage}).single("img");

module.exports = uploader;