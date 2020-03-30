const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    User = require("../models/User"),
    bcrypt = require("bcryptjs");

passport.serializeUser(function(user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser( async function(user, done) {
    console.log("Deserialized user id " + user.id);
    const found = await User.findByPk(user.id)
    found ? done(false, user) : done('user not found');
});

// @desc    Login user
// @route   POST /login
// @access  Public
exports.login = (req, res, next) => {
    const room = req.body.room ? req.body.room.replace(/</g, '').toLowerCase() : 'general';
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
            // res.json({user: user.username, room, message: info});

            res.redirect(`/chat?room=${room}`); // TODO: if same client
            // res.json({user: user.username, message: info }); // TODO: if web client
            return console.log(`User: ${req.user.username} has logged in`);
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

// @desc    Check if authenticated
exports.isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        console.log("Not Authenticated");
        res.redirect("/");
    }
}

// @desc    Check if not authenticated
exports.isNotAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/chat");
    }
}
