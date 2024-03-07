'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('storemodels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      store_name: {
        type: Sequelize.STRING,
        defaultValue: 'DBPOS'
      },
      store_address: {
        type: Sequelize.STRING,
        defaultValue: 'Padang'
      },
      store_phone: {
        type: Sequelize.STRING,
        defaultValue: '0000'
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('storemodels');
  }
};