// here we define the fastify-plugin to use the socket.io with fastify using SQLite for session storage
const fp = require("fastify-plugin");

// create socket module to use it in the fastify instance
module.exports = fp(async function (fastify, opts) {
	// define the Server instance from socket.io
	const { Server } = require("socket.io")

	// retrieve the sqlite connection from the fastify instance (make sure it's decorated earlier)
	const sqlite = fastify.sqlite;

	// configure the cors for the socket.io
	const io = new Server(fastify.server, {
		cors: { origin: "*" },
	})
	fastify.decorate("socket", io)

	fastify.ready((err) => {
		if (err) throw err
		// define a path route for the socket 
		const mainSocket = io.of("/socket");

		// authentication middleware
		mainSocket.use(async (socket, next) => {
			try {
				const { token } = socket.handshake.query
				if (token) {
					const { user_id, firstname, lastname, avatar } = fastify.jwt.verify(token)
					socket.user = { user_id, firstname, lastname, avatar }
					// Store the user_id and socket.id mapping into SQLite.
					// We use INSERT OR REPLACE so that if the user is already connected, the record is updated.
					sqlite.run(
						`INSERT OR REPLACE INTO socket_sessions (user_id, socket_id) VALUES (?, ?)`,
						[user_id, socket.id],
						(err) => {
							if (err) {
								fastify.log.error("Error inserting into socket_sessions:", err);
								return next(new Error("Database error"));
							}
							next();
						}
					)
				} else {
					next(new Error("Authentication error: No token provided"));
				}
			} catch (err) {
				next(new Error("Authentication error: Invalid token"));
			}
		});

		// Listen for connections on the namespace
		mainSocket.on("connection", (socket) => {
			console.log(`${socket.name} with id: ${socket.user_id} connected! with socket id: ${socket.id}`);

			// Connect the user to a room (for example, "chatting")
			socket.join("chatting")

			// On disconnect, remove the user mapping from SQLite
			socket.on("disconnect", () => {
				if (socket.user && socket.user.user_id) {
					sqlite.run(
						`DELETE FROM socket_sessions WHERE user_id = ?`,
						[socket.user.user_id],
						(err) => {
							if (err)
								fastify.log.error("Error deleting from socket_sessions:", err);
						}
					);
				}
			});
		})
	})
})