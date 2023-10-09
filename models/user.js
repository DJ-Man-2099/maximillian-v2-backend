const Sequelize = require("sequelize");
const sequelize = require("../database/mssql");

const User = sequelize.define("user", {
	_id: {
		type: Sequelize.INTEGER,
		allowNull: false,
		autoIncrement: true,
		primaryKey: true,
	},
	email: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	status: {
		type: Sequelize.STRING,
		allowNull: false,
		defaultValue: "I am new!!",
	},
});

module.exports = User;
