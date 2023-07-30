const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "Maximillian_Node_V2",
  "david",
  "Mega_Man2099",
  {
    dialect: "mssql",
    host: "DJ-PC",
    options: {
      encrypt: true,
    },
  }
);

/* sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
}); */

/* const instanceName = "DJ-PC";
const sequelize = new Sequelize({
  database: "Maximillian Node V2",
  username: "david",
  password: "Mega_Man2099",
  host: "DJ-PC",
  port: "1433",
  dialect: "mssql",
  logging: "console.log",
  dialectOptions: {
    instanceName: instanceName,
  },
  pool: {
    min: 5,
    max: 1000,
    acquire: 6000,
    idle: 6000,
  },
}); */

/* const sequelize = new Sequelize("maxmillian-node", "david", "Mega_Man2099", {
  dialect: "mssql",
  host: "localhost",
  dialectOptions: {
    encrypt: true,
  },
}); */

module.exports = sequelize;
