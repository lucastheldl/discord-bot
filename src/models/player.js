const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Player = sequelize.define("player", {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
});

module.exports = { Player };
