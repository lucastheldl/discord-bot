"use strict";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("characterItems", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			quantity: {
				type: Sequelize.INTEGER,
				defaultValue: 1,
			},
			equipped: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			CharacterId: {
				type: Sequelize.INTEGER,
				references: {
					model: "characters",
					key: "id",
				},
			},
			ItemId: {
				type: Sequelize.INTEGER,
				references: {
					model: "items",
					key: "id",
				},
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
		await queryInterface.dropTable("characterItems");
	},
};
