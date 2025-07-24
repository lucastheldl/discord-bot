"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. First create the stars table
    await queryInterface.createTable("stars", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("small", "giant", "huge", "black", "neutron"),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // 2. Add currentStarId to characters table
    await queryInterface.addColumn("characters", "currentStarId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "stars",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 3. Add currentStarId to planets table
    await queryInterface.addColumn("planets", "currentStarId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "stars",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // 4. Add currentStarId to vehicles table
    await queryInterface.addColumn("vehicles", "currentStarId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "stars",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove foreign key constraints first (order matters)
    await queryInterface.removeConstraint(
      "vehicles",
      "vehicles_currentStarId_fkey"
    );
    await queryInterface.removeConstraint(
      "planets",
      "planets_currentStarId_fkey"
    );
    await queryInterface.removeConstraint(
      "characters",
      "characters_currentStarId_fkey"
    );

    // Remove the columns
    await queryInterface.removeColumn("vehicles", "currentStarId");
    await queryInterface.removeColumn("planets", "currentStarId");
    await queryInterface.removeColumn("characters", "currentStarId");

    // Finally drop the stars table
    await queryInterface.dropTable("stars");
  },
};
