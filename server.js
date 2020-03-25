const fs = require("fs"),
    privateKey = fs.readFileSync("sslcert/key.pem", "utf8"), // SSL cert
    certificate = fs.readFileSync("sslcert/cert.pem", "utf8"),
    credentials = { key: privateKey, cert: certificate }, // add to createServer and mod http to https
    express = require("express"),
    app = express(),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    session = require("express-session"),
    passport = require("passport"), // Auth modules
    User = require("./models/User"),
    port = process.env.PORT || 3000;

global.server = require("http").createServer(app); // define server

const {login, localStrategy} = require('./controllers/auth');
const {uploadFile} = require('./controllers/chat');
const {startSocket} = require('./controllers/socket');

app.use(express.static("public")); // Set assets folder
// app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true }
    })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// set the view engine to ejs
app.set("view engine", "ejs");

server.listen(port);
console.log("Server running on port", port);

// Passport middleware
passport.use(localStrategy);

passport.serializeUser(function(user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("Deserialized user id " + user.id);
    User.get(user.id, function(err, user) {
        done(err, user);
    });
});

// create hashed password
//bcrypt.genSalt(10, function(err, salt) {
//   bcrypt.hash("bosa", salt, function(err, hash) {
//      console.log('Hash is',hash);
//   });
//});

// TODO: Check if user authenticated
function auth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log("Not Authenticated");
        res.redirect("/");
    }
}

// Routes
app.get("/", function(req, res) {
    res.render("index");
});

app.post("/login", login);
app.post("/upload", uploadFile);

app.get("/chat", auth, function(req, res) {
    id = req.user.id;
    console.log("User at route " + id);
    User.get(id, (err, user) => {
        console.log("Username is " + user.username);
        res.render("chat", { user: user });
    });
});

// Starting socket connection
startSocket();