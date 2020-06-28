const io = require("socket.io")(server),
	botName = "Chat Bot",
	connections = [];
const { formatMsg } = require("../controllers/chat");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
} = require("../controllers/user");

// @desc    Start socket
// @route   Socket
// @access  Public
exports.startSocket = () => {
	io.on("connection", (socket) => {
		connections.push(socket);

		socket.emit("connected", { id: socket.id });

		socket.on("joinRoom", ({ username, room }) => {
			const user = userJoin(socket.id, username, room);

			socket.join(room);

			// console.log(getRoomUsers(room));

			// Welcome current user
			socket.emit(
				"new message",
				formatMsg(`Welcome to ${user.room} room!`, botName)
			);

			// Broadcast when a user connects
			socket.broadcast
				.to(user.room)
				.emit(
					"new message",
					formatMsg(`${user.username} has joined the chat`, botName)
				);

			// Send users and room info
			io.to(user.room).emit("roomUsers", {
				room: user.room,
				users: getRoomUsers(user.room),
			});
		});

		// console.log(
		//     "Connection: %s sockets connected",
		//     connections.length,
		//     "socketID:",
		//     socket.id
		// );

		// Send Message
		socket.on("send message", (data) => {
			const user = getCurrentUser(socket.id);

			// console.log(data);
			if (user) {
				io.to(user.room).emit("new message", formatMsg(data.msg, data.user));
			} else {
				socket.emit(
					"new message",
					formatMsg("There was a problem, Please try again later!", botName)
				);
			}
		});

		// Show image
		showImg = (img, username) => {
			const user = getCurrentUser(username);

			if (typeof user !== "undefined") {
				data = { img, user: username };
				io.sockets.to(user.room).emit("show image", formatMsg(img, username));
				// console.log("Show Image Called with this data:", img);
			}
		};

		socket.on("typing", (data) => {
			const user = getCurrentUser(socket.id);
			if (user) {
				socket.broadcast.to(user.room).emit("typing", data);
			}
		});

		socket.on("call-cancel", (data) => {
			io.to(data.otherPeer).emit("call-rejected");
		});

		socket.on("disconnect", function (data) {
			const user = userLeave(socket.id);
			if (user) {
				io.to(user.room).emit(
					"new message",
					formatMsg(`${user.username} has left the chat`, botName)
				);

				io.to(user.room).emit("roomUsers", {
					room: user.room,
					users: getRoomUsers(user.room),
				});
			}

			// users.splice(users.indexOf(socket.username), 1);
			connections.splice(connections.indexOf(socket), 1);
			console.log("Disconnected: %s sockets connected", connections.length);
		});
	});
};
