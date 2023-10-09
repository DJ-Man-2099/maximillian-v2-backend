const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

const Post = require("../models/feed");
const { log } = require("console");
const User = require("../models/user");
const { post } = require("../routes/feed");
const ioHolder = require("../socket");

exports.getPostByID = async (req, res, next) => {
	const postId = req.params.postId;
	const post = await Post.findOne({
		include: [
			{
				model: User,
				as: "creator",
				attributes: ["name", "_id", "status"],
			},
		],
		where: {
			_id: postId,
		},
	}).catch((err) => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		return next(err);
	});
	if (!post) {
		const err = new Error("Post Cannot be Found");
		err.statusCode = 404;
		return next(err);
	}
	res.status(200).json(post);
};

exports.getPosts = async (req, res, next) => {
	const { page } = req.query;
	if (!page) {
		page = 1;
	}
	const perPage = 2;
	let count;
	let posts;
	let user;
	try {
		count = await Post.count();
		posts = await Post.findAll({
			include: [
				{
					model: User,
					as: "creator",
					attributes: ["name", "_id", "status"],
				},
			],
			order: [["_id", "DESC"]],
			offset: (page - 1) * perPage,
			limit: perPage,
		});
		/* user = await User.findByPk(req.userId);
		posts = await user.getPosts(); */
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		return next(error);
	}

	res.status(200).json({
		messgae: "Posts fetch Successfully",
		posts: posts,
		totalItems: count,
	});
};

exports.updatePost = async (req, res, next) => {
	const { id: postId } = req.params;
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed, entered data is incorrect.");
		error.statusCode = 422;
		//must return next(error)
		return next(error);
	}
	log(postId);
	const title = req.body.title;
	const content = req.body.content;
	let result;
	let user;
	try {
		user = await User.findByPk(req.userId, {
			attributes: ["_id", "name", "status"],
		});
		result = (await user.getPosts({ where: { _id: postId } })).at(0);
		// result = await Post.findOne({
		// 	where: { postId: postId, creator: user._id },
		// });
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		return next(e);
	}

	if (!result) {
		const err = new Error("Post Cannot be Found");
		err.statusCode = 404;
		return next(err);
	}
	let imageUrl = result.imageUrl;
	if (req.file) {
		imageUrl = req.file.path.replace("\\", "/");
	}
	if (!imageUrl) {
		const err = new Error("no image uploaded");
		err.statusCode = 422;
		return next(err);
	}
	log(`imageUrl: ${imageUrl}`);
	log(`result.imageUrl: ${result.imageUrl}`);
	if (imageUrl !== result.imageUrl) {
		clearImage(result.imageUrl);
	}
	result.title = title;
	result.imageUrl = imageUrl;
	result.content = content;
	await result.save();
	const fullPost = {
		...result.dataValues,
		creator: {
			name: user.name,
			_id: user._id,
			status: user.status,
		},
	};
	ioHolder.getIO().emit("posts", {
		action: "update",
		post: fullPost,
	});
	res.status(201).json({
		message: "Post updated successfully!",
		post: fullPost,
	});
};
exports.createPost = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error("Validation failed, entered data is incorrect.");
		error.statusCode = 422;
		//must return next(error)
		return next(error);
	}
	if (!req.file) {
		const error = new Error("no image found");
		error.statusCode = 422;
		//must return next(error)
		return next(error);
	}
	const imageUrl = req.file.path;
	const title = req.body.title;
	const content = req.body.content;
	// Create post in db
	let result;
	let user;
	try {
		user = await User.findByPk(req.userId);
		const post = {
			title: title,
			content: content,
			imageUrl: imageUrl.replace("\\", "/"),
		};
		result = await user.createPost(post);
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		return next(e);
	}
	const fullPost = {
		...result.dataValues,
		creator: {
			_id: user._id,
			name: user.name,
			status: user.status,
		},
	};
	ioHolder.getIO().emit("posts", {
		action: "create",
		post: fullPost,
	});
	res.status(201).json({
		message: "Post created successfully!",
		post: fullPost,
	});
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => log(err));
};

exports.deletePost = async (req, res, next) => {
	const { id: postId } = req.params;
	let result, user;
	try {
		user = await User.findByPk(req.userId);
		result = (
			await user.getPosts({
				include: {
					model: User,
					as: "creator",
					attributes: ["name", "_id", "status"],
				},
				where: {
					_id: postId,
				},
			})
		).at(0);
		if (!result) {
			const error = new Error("Could not find post");
			error.statusCode = 404;
			return next(error);
		}
		clearImage(result.imageUrl);
		await result.destroy();
		ioHolder.getIO().emit("posts", {
			action: "delete",
			post: result,
		});
		res.status(200).json({
			message: "Post Deleted",
		});
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		return next(e);
	}
};
