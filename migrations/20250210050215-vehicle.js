"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("vehicles", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: Sequelize.STRING,
			description: Sequelize.STRING,
			img: Sequelize.STRING,
			type: Sequelize.STRING,
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
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("vehicles");
	},
};
