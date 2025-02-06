const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Planet = sequelize.define("planets", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	type: Sequelize.STRING, // Example: rock, gas, mecha
});

module.exports = { Planet };
