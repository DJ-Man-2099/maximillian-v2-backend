const { Server } = require("socket.io");

let iosocket;
module.exports = {
	init: (server) => {
		iosocket = new Server(server, {
			cors: {
				allowedHeaders: "*",
			},
		});
		return iosocket;
	},
	getSocket: () => {
		if (!iosocket) {
			throw new Error("Socket not initialized");
		}
		return iosocket;
	},
};
