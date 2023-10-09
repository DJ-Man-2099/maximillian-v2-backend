const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const userController = require("../controllers/user");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
	"/signup",
	[
		body("email")
			.trim()
			.isEmail()
			.withMessage("Email is invalid")
			.custom(async (value, { req }) => {
				const userDoc = await User.findOne({
					where: { email: value },
				});
				if (userDoc) {
					return Promise.reject("Email already exists!!!");
				}
			})
			.normalizeEmail(),
		body("password")
			.trim()
			.isStrongPassword()
			.withMessage("Password isn't Strong Enough"),
		body("name").trim().notEmpty().withMessage("name can't be empty"),
	],
	userController.signUp
);

router.post("/login", userController.logIn);
router.get("/status", isAuth, userController.getStatus);
router.post("/status", isAuth, userController.setStatus);

module.exports = router;
