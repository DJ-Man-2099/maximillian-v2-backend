const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");
const JWT = require("jsonwebtoken");

const User = require("../models/user");

exports.getStatus = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.userId);
		if (!user) {
			const err = new Error("User not found");
			err.statusCode = 404;
			return next(err);
		}
		res.status(200).json({
			status: user.status,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		return next(error);
	}
};

exports.setStatus = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.userId);
		if (!user) {
			const err = new Error("User not found");
			err.statusCode = 404;
			return next(err);
		}
		console.log(req.body);
		user.status = req.body.status;
		result = await user.save();
		res.status(200).json({
			status: user.status,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		return next(error);
	}
};

exports.signUp = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation Failed!!!");
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}
	const { email, name, password } = req.body;
	let result, hashedPassword;
	try {
		hashedPassword = bcryptjs.hashSync(password, 12);
		result = await User.create({
			email: email,
			name: name,
			password: hashedPassword,
		});
	} catch (error) {
		console.log(error);
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
	res.status(201).json({
		message: "User Created Successfully",
		userId: result.dataValues._id,
	});
};

exports.logIn = async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({
		where: {
			email: email,
		},
	});
	if (!user) {
		const err = new Error("User Doesn't exist");
		err.statusCode = 401;
		return next(err);
	}
	const isValidated = await bcryptjs.compare(
		password,
		user.dataValues.password
	);
	if (!isValidated) {
		const err = new Error("Password is incorrect");
		err.statusCode = 401;
		return next(err);
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
	res.status(200).json({
		message: "Login is Successful",
		token: token,
		userId: user.dataValues._id,
	});
};
