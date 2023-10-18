const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");
const { default: validator } = require("validator");

const User = require("../../models/user");

exports.createUser = async ({ userInput }, req) => {
	const { email, name, password } = userInput;
	const errors = [];
	if (!validator.isEmail(email)) {
		errors.push({
			message: "Email is invalid",
		});
	}
	if (
		validator.isEmpty(password) ||
		!validator.isLength(password, {
			min: 5,
		})
	) {
		errors.push({
			message: "Password is Too Short!!!",
		});
	}
	if (errors.length > 0) {
		const error = new Error("Invalid Input");
		error.data = errors;
		error.code = 422;
		throw error;
	}
	const user = await User.findOne({
		where: {
			email: email,
		},
	});
	if (user) {
		const err = new Error("User Exists Already!!");
		throw err;
	}
	let createdUser, hashedPassword;
	try {
		hashedPassword = bcryptjs.hashSync(password, 12);
		createdUser = await User.create({
			email: email,
			password: hashedPassword,
			status: "I am new!!!",
			name: name,
		});
	} catch (error) {
		console.log(error);
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		throw error;
	}
	return {
		...createdUser.dataValues,
		posts: [],
	};
};

exports.login = async ({ email, password }, req) => {
	const user = await User.findOne({
		where: {
			email: email,
		},
	});
	if (!user) {
		const err = new Error("User Not Found!!");
		err.code = 401;
		throw err;
	}
	const isAuth = bcryptjs.compareSync(password, user.password);
	if (!isAuth) {
		const err = new Error("Password is Incorrect!!");
		err.code = 401;
		throw err;
	}
	const token = JWT.sign(
		{
			email: user.email,
			userId: user._id,
		},
		"DJ_Rules_@nytime_@nyplace",
		{
			expiresIn: "1h",
		}
	);
	return { token: token, userId: user._id };
};

exports.getStatus = async (args, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	let user;
	try {
		user = await User.findByPk(req.userId);
		if (!user) {
			const error = new Error("User Not Found!!");
			error.code = 404;
			throw error;
		}
	} catch (error) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		throw e;
	}
	console.log(user.status);
	return user.status;
};

exports.updateStatus = async ({ status }, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	let user;
	try {
		user = await User.findByPk(req.userId);
		if (!user) {
			const error = new Error("User Not Found!!");
			error.code = 404;
			throw error;
		}
	} catch (error) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		throw e;
	}
	user.status = status;
	await user.save();
	return user.status;
};
