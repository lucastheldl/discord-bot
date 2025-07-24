"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("characters", "isInsideVehicle", {
      type: Sequelize.BOOLEAN,
      allowNull: false, // or false if age is required
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("characters", "isInsideVehicle");
  },
};
