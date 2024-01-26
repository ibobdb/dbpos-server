'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('tb_product_out', 'price', {
      type: Sequelize.INTEGER
    })
    await queryInterface.addColumn('tb_product_out', 'product_name', {
      type: Sequelize.STRING
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('tb_product_out', 'price');
    await queryInterface.removeColumn('tb_product_out', 'product_name');
  }
};
