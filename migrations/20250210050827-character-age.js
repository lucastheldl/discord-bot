"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("characters", "age", {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if age is required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("characters", "age");
  },
};
