const fs = require("fs"),
    privateKey = fs.readFileSync("sslcert/key.pem", "utf8"), // SSL cert
    certificate = fs.readFileSync("sslcert/cert.pem", "utf8"),
    credentials = { key: privateKey, cert: certificate }, // add to createServer and change http to https
    express = require("express"),
    app = express(),
    env = require('dotenv'),
    cookieParser = require("cookie-parser"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    session = require("express-session"),
    passport = require("passport"), // Auth module
    port = process.env.PORT || 3000;

// Load env variables
env.config();

if (parseInt(process.env.HTTPS)) { // define server
    global.server = require("https").createServer(credentials, app);
}else{
    global.server = require("http").createServer(app);
}

const {login, localStrategy, isAuth, isNotAuth} = require('./controllers/auth');
const {webChat, uploadFile} = require('./controllers/chat');
const {startSocket} = require('./controllers/socket');

app.use(express.static("public")); // Set assets folder
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: parseInt(process.env.HTTPS) ? true : false }
    })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());
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

// create hashed password
//bcrypt.genSalt(10, function(err, salt) {
//   bcrypt.hash("saltien", salt, function(err, hash) {
//      console.log('Hash is',hash);
//   });
//});

// Routes
app.get("/", isNotAuth, (req, res) => {
    res.render("login");
});
app.post("/login", login);
app.post("/upload", uploadFile);
app.get("/chat", isAuth, webChat);

// Starting socket connection
startSocket();

// server.on('clientError', (err, socket) => {
//     console.error(err);
//     socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
// });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server and exit process
    server.close(() => process.exit(1));
});