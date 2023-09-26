const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const db = require("./database/mssql");
const feedRoutes = require("./routes/feed");

const Feed = require("./models/feed");
const { log } = require("console");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

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

app.use((err, req, res, next) => {
	log(`error is caught: ${err}`);
	const { statusCode, message } = err;
	res.status(statusCode || 500).json({
		message: message,
	});
});

db.sync(/* { force: true } */)
	.then((result) => {
		app.listen(8080);
	})
	.catch((e) => {
		console.log(e);
	});
