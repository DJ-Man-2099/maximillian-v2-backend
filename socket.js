let io;
const { Server } = require("socket.io");

module.exports = {
	init: (httpServer) => {
		io = new Server(httpServer, {
			cors: {
				allowedHeaders: "*",
			},
		});
		return io;
	},
	getIO: () => {
		if (!io) {
			throw new Error("Socket not initialized!!");
		}
		return io;
	},
};
