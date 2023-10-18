const feedResolvers = require("./resolvers/feed");
const userResolvers = require("./resolvers/user");

module.exports = {
	hello: () => {
		return "Hello Word";
	},
	...userResolvers,
	...feedResolvers,
};
