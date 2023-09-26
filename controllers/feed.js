const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const Post = require("../models/feed");
const { log } = require("console");

exports.getPostByID = async (req, res, next) => {
	const postId = req.params.postId;
	const post = await Post.findByPk(postId).catch((err) => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	});
	if (!post) {
		const err = new Error("Post Cannot be Found");
		err.statusCode = 404;
		next(err);
	}
	res.status(200).json({ ...post.dataValues, creator: { name: post.creator } });
};

exports.getPosts = async (req, res, next) => {
	const posts = await Post.findAll().catch((err) => {
		if (!err.statusCode) {
			err.statusCode = 500;
		}
		next(err);
	});

	res.status(200).json({
		posts: posts.map((post) => {
			return {
				...post.dataValues,
				creator: {
					name: post.creator,
				},
			};
		}),
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
	let imageUrl = req.body.image;
	const title = req.body.title;
	const content = req.body.content;
	if (req.file) {
		imageUrl = req.file.path.replace("\\", "/");
	}
	if (!imageUrl) {
		const err = new Error("no image uploaded");
		err.statusCode = 422;
		return next(err);
	}
	const post = {
		title: title,
		content: content,
		creator: "Maximillian",
		imageUrl: imageUrl.replace("\\", "/"),
	};
	// Create post in db
	let result;
	try {
		result = await Post.findByPk(postId);
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
	if (imageUrl !== post.imageUrl) {
		clearImage(post.imageUrl);
	}
	result.title = title;
	result.imageUrl = imageUrl;
	result.content = content;
	await result.save();
	res.status(201).json({
		message: "Post updated successfully!",
		post: result,
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
	"".replace("\\", "/");
	const post = {
		title: title,
		content: content,
		creator: "Maximillian",
		imageUrl: imageUrl.replace("\\", "/"),
	};
	// Create post in db
	let result;
	try {
		result = await Post.create(post);
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		return next(e);
	}

	res.status(201).json({
		message: "Post created successfully!",
		post: {
			...result.dataValues,
			creator: {
				name: result.creator,
			},
		},
	});
};

const clearImage = (filePath) => {
	filePath = path.join(__dirname, "..", filePath);
	fs.unlink(filePath, (err) => log(err));
};

exports.deletePost = async (req, res, next) => {
	const { id: postId } = req.params;
	let result;
	try {
		result = await Post.findByPk(postId);
		if (!result) {
			const error = new Error("Could not find post");
			error.statusCode = 404;
			throw error;
		}
		clearImage(result.imageUrl);
		await result.destroy();
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
