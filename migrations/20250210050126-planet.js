"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("planets", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: Sequelize.STRING,
			description: Sequelize.STRING,
			type: Sequelize.STRING,
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
		await queryInterface.dropTable("planets");
	},
};
