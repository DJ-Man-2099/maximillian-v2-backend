const express = require("express");
const { body } = require("express-validator");

const feedController = require("../controllers/feed");

const router = express.Router();

// GET /feed/posts
router.get("/posts", feedController.getPosts);
router.get("/post/:postId", feedController.getPostByID);

// POST /feed/post
router.post(
	"/post",
	[
		body(["title", "content"], "Field Must be filled").trim().notEmpty(),
		body(["title", "content"], "Field Must be of 5 chars or more")
			.trim()
			.isLength({
				min: 5,
			}),
	],
	feedController.createPost
);

// PUT /feed/post
router.put(
	"/post/:id",
	[
		body(["title", "content"], "Field Must be filled").trim().notEmpty(),
		body(["title", "content"], "Field Must be of 5 chars or more")
			.trim()
			.isLength({
				min: 5,
			}),
	],
	feedController.updatePost
);

router.delete("/post/:id", feedController.deletePost);

module.exports = router;
