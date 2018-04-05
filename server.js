const fs = require('fs');
// SSL cert.
const privateKey = fs.readFileSync('sslcert/key.pem', 'utf8'),
    certificate = fs.readFileSync('sslcert/cert.pem', 'utf8'),
    credentials = {key: privateKey, cert: certificate};

const express = require('express'),
    app = express(),
    server = require('https').createServer(credentials,app), //Starting server
    io = require('socket.io').listen(server),
    path = require('path'),
    users = [];
    connections = [];
    Sql = require('sequelize'), // Setting Database connection
    sql = new Sql('chat','root','',{
        host: 'localhost',
        dialect: 'mysql',
        operatorsAliases: false,
        pool:{
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });

//Test db connection
sql
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Models
const User = sql.define('user', {
    id: {
      type: Sql.INTEGER, autoIncrement:true, primaryKey:true
    },
    username: {
      type: Sql.STRING
    },
    password: {
        type: Sql.STRING
    },
    profile_pic: {
        type: Sql.STRING
    }
    
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

server.listen(process.env.PORT || 3000);
console.log('Server running...')

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    // Disconnect socket
    socket.on('disconnect', function(data){
        users.splice(users.indexOf(socket.username), 1);
        updateUsernames();
        connections.splice(connections.indexOf(socket),1);
        console.log('Disconnected: %s sockets connected', connections.length);
    });
    
    // Send Message
    socket.on('send message', function(data){
        console.log(data);
        io.sockets.emit('new message', {msg: data, user: socket.username});
    });

    socket.on('new user', function(data, callback){
        callback(true);
        // Create user in the db
        User.create({
                  username: data.username,
                  password: data.password
                });
        socket.username = data.username;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    }
});