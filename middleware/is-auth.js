const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	let error;
	if (!authHeader) {
		error = new Error("Not Auth");
		error.statusCode = 401;
		throw error;
	}
	const token = authHeader.split(" ")[1];
	let decodedToken;
	try {
		decodedToken = JWT.verify(token, "DJ_Rules_@nytime_@nyplace");
	} catch (err) {
		err.statusCode = 500;
		throw err;
	}
	if (!decodedToken) {
		error = new Error("Not Auth");
		error.statusCode = 401;
		throw error;
	}
	console.log(decodedToken);
	req.userId = decodedToken.userId;
	next();
};
