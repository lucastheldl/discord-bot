const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Vehicle = sequelize.define("vehicles", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	img: Sequelize.STRING,
	type: Sequelize.STRING, // Example: "spaceship", "car", "bike"
	currentFuel: Sequelize.INTEGER,
	maxFuel: Sequelize.INTEGER,
	armor: Sequelize.INTEGER,
	damage: Sequelize.INTEGER,
	class: Sequelize.ENUM("C", "B", "A", "SUPER", "MEGA", "OMEGA"),
	currentPlanetId: {
		type: Sequelize.INTEGER,
		references: {
			model: "planets",
			key: "id",
		},
		allowNull: true,
	},
	currentLocationId: {
		type: Sequelize.INTEGER,
		references: {
			model: "locations",
			key: "id",
		},
		allowNull: true,
	},
});

module.exports = { Vehicle };
