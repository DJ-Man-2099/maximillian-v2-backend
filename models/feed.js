const Sequelize = require("sequelize");
const sequelize = require("../database/mssql");

const Feed = sequelize.define("feed", {
  _id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  title: { type: Sequelize.STRING, allowNull: false },
  content: { type: Sequelize.STRING, allowNull: false },
  imageUrl: { type: Sequelize.STRING, allowNull: false },
  creator: { type: Sequelize.STRING, allowNull: false },
});

module.exports = Feed;
