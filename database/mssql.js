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

module.exports = sequelize;
