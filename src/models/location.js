const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Location = sequelize.define("locations", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: Sequelize.STRING,
	type: Sequelize.STRING, // Example: city, natural,
	population: Sequelize.INTEGER, // 0 - no one, 10 - metropole
	capital: Sequelize.INTEGER, // 0 - natual, 10 - extremely rich
	planetId: {
		type: Sequelize.INTEGER,
		references: {
			model: "planets",
			key: "id",
		},
		allowNull: true,
	},
});

module.exports = { Location };
