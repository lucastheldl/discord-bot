const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Character = sequelize.define("character", {
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
});

module.exports = { Character };
