"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("items", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: Sequelize.STRING,
			type: Sequelize.STRING,
			defence: Sequelize.INTEGER,
			damage: Sequelize.INTEGER,
			class: Sequelize.ENUM("C", "B", "A", "SUPER", "MEGA", "OMEGA"),
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
		await queryInterface.dropTable("items");
	},
};
