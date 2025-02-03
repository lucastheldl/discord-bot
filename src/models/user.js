const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const User = sequelize.define("users", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	currentCharacterId: {
		type: Sequelize.INTEGER,
		references: {
			model: "characters",
			key: "id",
		},
		allowNull: true,
	},
});

module.exports = { User };
