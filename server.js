const fs = require('fs');
// SSL cert.
const privateKey = fs.readFileSync('sslcert/key.pem', 'utf8'),
    certificate = fs.readFileSync('sslcert/cert.pem', 'utf8'),
    credentials = {key: privateKey, cert: certificate};

const express = require('express'),
    app = express(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    redis = require("redis"),
    client = redis.createClient(),
    RedisStore = require('connect-redis')(session),
    passport = require('passport'), // Auth modules
    LocalStrategy = require('passport-local').Strategy,
    server = require('https').createServer(credentials,app), //Starting server
    io = require('socket.io').listen(server),
    path = require('path'),
    users = [];
    connections = [];
    Sql = require('orm'), // Setting Database connection
    Sql.connect("mysql://root:@localhost/chat", function (err, db) {
    if (err) throw err;
        console.log('Database connected..')
        const User = db.define("users", {
            username   : String,
            password   : String,
        }, {
            methods: {
                fullName: function () {
                    return this.name + ' ' + this.surname;
                }
            },
        });

        client.on('error', function (err) {
            console.log("Error " + err);
        });
        
        client.on('connect', function () {
            console.log("redis connected...");
        });
//   // force: true will drop the table if it already exists
//   User.sync({force: true}).then(() => {
//     // Table created
//     return User.create({
//       username: 'Admin'
//     });
//   });

// Static asset folder
app.use(express.static('public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ store: new RedisStore(),
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: true } })); 
 // Passport init
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// set the view engine to ejs
app.set('view engine', 'ejs');

server.listen(process.env.PORT || 3000);
console.log('Server running...');

// Middleware
// Passport middleware
passport.use(new LocalStrategy(
    function(username, password, done) {
      User.one({ username: username }, function(err, user) {
          console.log('In the passport!')
        if (err) { return done(err); }
        if (!user) {
          console.log('Not a user');
          return done(null, false, { message: 'Incorrect username.' });
        }
        // if (!user.validPassword(password)) {
        //   return done(null, false, { message: 'Incorrect password.' });
        // }
        return done(null, user);
      });
    }
  ));

function auth(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }else{
        console.log('Not Authenticated');
        res.redirect('/');
        }
    }

  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
      console.log('Deserialized user id '+user.id);
    User.get(user.id, function(err, user) {
      done(err, user);
    });
  });

// Routes
app.get('/', function(req, res){
    res.render('index');
});
app.post('/login', 
    passport.authenticate('local',{successRedirect: '/chat',failureRedirect: '/'}));

app.get('/chat', auth, function(req, res){
    id = req.user.id;
    console.log('User at route '+id);
    User.get(id, (err, user)=>{
        console.log('Username is '+ user.username);
        users.push(user.username);
        res.render('chat', {user:user });
    })
});

// Starting socket connection

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    // Send Message
    socket.on('send message', function(data){
        console.log(data);
        io.sockets.emit('new message', {msg: data.msg, user: data.user});

    });

    // socket.on('new user', function(data, callback){
    //     // callback(true);
    //     updateUsernames();
    //     // User.create({
    //     //           username: data.username,
    //     //           password: data.password
    //     //         });
    //     // socket.username = data.username;

    //     // User.findOne({ where: {username: data.username} }).then(user => {
    //     //     console.log(user.username);
    //     //     socket.username = user.username;
    //     //     users.push(socket.username);
    //     // })
    // });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});
});