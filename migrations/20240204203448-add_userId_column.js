'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tb_stock_log', 'user_id', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addColumn('tb_transactions', 'user_id', {
      type: Sequelize.INTEGER
    })
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('tb_stock_log', 'user_id')
    await queryInterface.removeColumn('tb_transactions', 'user_id')
  }
};
