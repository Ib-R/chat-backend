const uploader = require('../config/storage');
const moment = require('moment');

// @desc    Upload files
// @route   POST /upload
// @access  Public
exports.uploadFile = (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    uploader(req, res, err => {
        if (err) {
            console.log(err);
            res.json({ error: err });
        } else {
            console.log(req.body.username);
            showImg(req.file.filename, req.body.username);
            res.json({
                message: "uploaded, file: " + req.file.filename
            });
            console.log(req.file);
        }
    });
};

// @desc    Web chat page
// @route   GET /chat
// @access  Private
exports.webChat = (req, res) => {
    res.render("chat", { user: req.user });
};

exports.formatMsg = (msg, user) => {
    return {msg, user, time: moment().format('hh:mm a')};
};