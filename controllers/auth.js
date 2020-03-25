const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    User = require("../models/User"),
    bcrypt = require("bcryptjs");

// @desc    Login user
// @route   POST /login
// @access  Public
exports.login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        res.header("Access-Control-Allow-Origin", "*");
        if (err) {
            res.json({ message: info });
            return next(err);
        }
        if (!user) {
            return res.json({ message: info });
        }
        req.logIn(user, function(err) {
            console.log("login function!");
            if (err) {
                return next(err);
            }
            res.json({ user: user.username, message: info });
            return console.log("End of login route");
        });
    })(req, res, next);
};

// @desc    LocalStrategy for Passport
exports.localStrategy = new LocalStrategy(async function(
    username,
    password,
    done
) {
    const user = await User.findOne({ where: { username: username } });
    if (!user) {
        console.log("Not a user");
        return done(null, false, { message: "Incorrect username." });
    }

    if (
        passCheck(password, user.password, (err, match) => {
            if (err) throw err;
            if (match) {
                return done(null, user);
            } else {
                return done(null, false, {
                    message: "Incorrect password."
                });
            }
        })
    );
});

// @desc    Check password
function passCheck(password, hash, callback) {
    bcrypt.compare(password, hash, function(err, match) {
        if (err) {
            console.log(err);
        } else {
            callback(null, match);
        }
    });
}
