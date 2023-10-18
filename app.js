require("graphql-import-node/register");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");
var { graphqlHTTP } = require("express-graphql");
const { log } = require("console");

const db = require("./database/mssql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolvers = require("./graphql/resolvers");
const Feed = require("./models/feed");
const User = require("./models/user");
const auth = require("./middleware/is-auth");
const socket = require("./middleware/socket");

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

app.use(auth);

app.post("/uploadImage", async (req, res, next) => {
	if (!req.file) {
		const error = new Error("no image found");
		error.statusCode = 422;
		return res.status(error.statusCode).json(error);
	}
	if (!req.isAuth) {
		const error = new Error("User not Authenticated");
		error.code = 401;
		return res.status(error.statusCode).json(error);
	}
	return res.status(200).json({
		imageUrl: req.file.filename,
	});
});

app.use(
	"/graphql",
	graphqlHTTP({
		schema: graphqlSchema,
		rootValue: graphqlResolvers,
		graphiql: true,
		customFormatErrorFn: (err) => {
			if (!err.originalError) {
				return err;
			}
			const data = err.originalError.data;
			const code = err.originalError.code || 500;
			const message = err.message || "An error occured";
			return {
				message: message,
				data: data,
				code: code,
			};
		},
	})
);

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
		const io = socket.init(server);
		io.on("connection", (socket) => {
			log("A User Connected");
		});
	})
	.catch((e) => {
		console.log(e);
	});
