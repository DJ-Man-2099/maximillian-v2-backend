const express = require("express");
const bodyParser = require("body-parser");

const db = require("./database/mssql");
const feedRoutes = require("./routes/feed");

const Feed = require("./models/feed");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

db.sync({ force: true })
  .then((result) => {
    app.listen(8080);
  })
  .catch((e) => {
    console.log(e);
  });
