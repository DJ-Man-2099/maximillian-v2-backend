const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const db = require("./database/mssql");
const feedRoutes = require("./routes/feed");
const userRoutes = require("./routes/user");

const Feed = require("./models/feed");
const User = require("./models/user");
const { log } = require("console");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

User.hasMany(Feed, {
	as: {
		singular: "post",
		plural: "posts",
	},
	foreignKey: { name: "creatorId", allowNull: false },
	onDelete: "CASCADE",
	onUpdate: "CASCADE",
});
Feed.belongsTo(User, {
	as: "creator",
	foreignKey: { name: "creatorId", allowNull: false },
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	},
});

const fileFilter = (req, file, cb) => {
	switch (file.mimetype) {
		case "image/png":
		case "image/jpg":
		case "image/jpeg":
			cb(null, true);
			break;

		default:
			cb(null, false);
			break;
	}
};

app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use("/feed", feedRoutes);
app.use("/auth", userRoutes);

app.use((err, req, res, next) => {
	log(`error is caught: ${err}`);
	const { statusCode, message, data } = err;
	res.status(statusCode || 500).json({
		message: message,
		data: data,
	});
});

db.sync(/* { force: true } */)
	.then((result) => {
		const server = app.listen(8080);
		const io = require("./socket").init(server);
		io.on("connection", (socket) => {
			log("client connected");
		});
	})
	.catch((e) => {
		console.log(e);
	});
