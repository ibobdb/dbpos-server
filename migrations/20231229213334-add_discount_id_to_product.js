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
    await queryInterface.addColumn('tb_products', 'discount_id', {
      type: Sequelize.INTEGER
    });
    await queryInterface.addColumn('tb_products', 'brand', {
      type: Sequelize.STRING
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('tb_products', 'discount_id');
    await queryInterface.removeColumn('tb_products', 'brand');
  }
};
