const { default: validator } = require("validator");
const fs = require("fs");
const path = require("path");
const { log } = require("console");

const User = require("../../models/user");
const Feed = require("../../models/feed");
const socket = require("../../middleware/socket");

exports.upsertPost = async ({ postInput }, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	const userId = req.userId;
	const { title, content, imageUrl, isNew } = postInput;
	const errors = [];
	if (
		validator.isEmpty(title) ||
		!validator.isLength(title, {
			min: 5,
		})
	) {
		errors.push({
			message: "Title must be 5 chars or more",
		});
	}
	if (
		validator.isEmpty(content) ||
		!validator.isLength(content, {
			min: 5,
		})
	) {
		errors.push({
			message: "Content must be 5 chars or more",
		});
	}
	if (isNew && (!imageUrl || validator.isEmpty(imageUrl))) {
		errors.push({
			message: "Image Can't be empty",
		});
	}
	if (errors.length > 0) {
		const error = new Error("Invalid Input");
		error.data = errors;
		error.code = 422;
		throw error;
	}
	let result;
	let user;
	try {
		user = await User.findByPk(userId);
		if (!user) {
			const error = new Error("User Not Found!!");
			error.code = 404;
			throw error;
		}
		const post = {
			title: title,
			content: content,
			imageUrl: imageUrl,
		};
		if (isNew) {
			result = await user.createPost(post);
		} else {
			const postId = postInput.postId;
			let post = await user.getPosts({
				where: { _id: postId },
			});
			if (post.length == 0) {
				const error = new Error("User can't edit this post!!");
				error.code = 401;
				throw error;
			}
			post = post[0];
			log(post);
			post.title = title;
			post.content = content;
			log(`post.imageUrl: ${post.imageUrl == undefined}`);
			log(`imageUrl: ${imageUrl == undefined}`);
			if (imageUrl && imageUrl != post.imageUrl) {
				clearImage(post.imageUrl);
				post.imageUrl = imageUrl;
			}
			result = await post.save();
		}
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		throw e;
	}
	const fullPost = {
		...result.dataValues,
		createdAt: result.createdAt.toISOString(),
		updatedAt: result.updatedAt.toISOString(),
		creator: {
			_id: user._id,
			name: user.name,
			status: user.status,
		},
	};
	socket
		.getSocket()
		.emit("posts", { action: isNew ? "create" : "update", post: fullPost });
	return fullPost;
};

exports.deletePost = async ({ postId }, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	const userId = req.userId;
	let result;
	let user;
	try {
		user = await User.findByPk(userId);
		if (!user) {
			const error = new Error("User Not Found!!");
			error.code = 404;
			throw error;
		}
		let post = await user.getPosts({
			where: { _id: postId },
		});
		if (post.length == 0) {
			const error = new Error("User can't delete this post!!");
			error.code = 401;
			throw error;
		}
		post = post[0];
		clearImage(post.imageUrl);
		result = await post.destroy();
	} catch (e) {
		console.log(e);
		if (!e.statusCode) {
			e.statusCode = 500;
		}
		throw e;
	}
	socket.getSocket().emit("posts", { action: "delete" });
	return "Post Deleted Successfully";
};

exports.getPosts = async ({ limit, page }, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	const feedLimit = limit || 2;
	const feedOffset = (page - 1 || 0) * feedLimit;
	const posts = await Feed.findAll({
		include: {
			model: User,
			as: "creator",
		},
		order: [["createdAt", "DESC"]],
		limit: feedLimit,
		offset: feedOffset,
	});
	const count = await Feed.count();
	return {
		posts: posts.map((post) => {
			return {
				...post.dataValues,
				createdAt: post.createdAt.toISOString(),
				updatedAt: post.updatedAt.toISOString(),
			};
		}),
		totalItems: count,
	};
};

exports.getPost = async ({ postId }, req) => {
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		throw error;
	}
	const post = await Feed.findByPk(postId, {
		include: {
			model: User,
			as: "creator",
		},
	});
	return {
		...post.dataValues,
		createdAt: post.createdAt.toISOString(),
		updatedAt: post.updatedAt.toISOString(),
	};
};

const clearImage = (imageName) => {
	const imagePath = path.join(__dirname, "..", "..", "images", imageName);
	log(imagePath);
	if (fs.existsSync(imagePath)) {
		fs.rmSync(imagePath);
	}
};
