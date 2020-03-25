const io = require("socket.io").listen(server),
    users = [],
    connections = [];

// @desc    Start socket
// @route   Socket
// @access  Public
exports.startSocket = () => {
    io.sockets.on("connection", function(socket) {
        connections.push(socket);
        console.log(
            "Connection: %s sockets connected",
            connections.length,
            "socketID:",
            socket.id
        );

        socket.on("disconnect", function(data) {
            users.splice(users.indexOf(socket.username), 1);
            connections.splice(connections.indexOf(socket), 1);
            console.log(
                "Disconnected: %s sockets connected",
                connections.length
            );
        });

        // Send Message
        socket.on("send message", data => {
            console.log(data);
            io.sockets.emit("new message", { msg: data.msg, user: data.user });
        });
        // Show image
        showImg = (img, user) => {
            data = { img: img, user: user };
            io.sockets.emit("show image", data);
            console.log("Show Image Called with this data:", img);
        };

        socket.on("typing", data => {
            socket.broadcast.emit("typing", data);
        });
    });
};
