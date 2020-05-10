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
    const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';
    const tagOrComment = new RegExp(
        '<(?:'
        // Comment body.
        + '!--(?:(?:-*[^->])*--+|-?)'
        // Special "raw text" elements whose content should be elided.
        + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
        + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
        // Regular name
        + '|/?[a-z]'
        + tagBody
        + ')>',
        'gi');
    msg = msg.replace(tagOrComment, '');
    return {msg, user, time: moment().format('hh:mm a')};
};