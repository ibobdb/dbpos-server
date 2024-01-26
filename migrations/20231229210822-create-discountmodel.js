'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tb_discount', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      discount_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      discount_start_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      discount_end_on: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      discount_type: {
        type: Sequelize.STRING,
        allowNull: false,
        // PERCENT // CONSTANT
      },
      discount_status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tb_discount');
  }
};