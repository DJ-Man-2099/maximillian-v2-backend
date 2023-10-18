const JWT = require("jsonwebtoken");

module.exports = (req, res, next) => {
	const authHeader = req.get("Authorization");
	let error;
	if (!authHeader) {
		req.isAuth = false;
		return next();
	}
	const token = authHeader.split(" ")[1];
	let decodedToken;
	try {
		decodedToken = JWT.verify(token, "DJ_Rules_@nytime_@nyplace");
	} catch (err) {
		req.isAuth = false;
		return next();
	}
	if (!decodedToken) {
		req.isAuth = false;
		return next();
	}
	console.log(decodedToken);
	req.isAuth = true;
	req.userId = decodedToken.userId;
	next();
};
