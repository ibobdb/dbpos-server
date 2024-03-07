'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // /**
    //  * Add seed commands here.
    //  *
    //  * Example:
    //  * await queryInterface.bulkInsert('People', [{
    //  *   name: 'John Doe',
    //  *   isBetaMember: false
    //  * }], {});
    // */
    await queryInterface.bulkInsert('storemodels', [{
      store_name: 'DBPOS',
      store_address: 'Padang, West Sumatera',
      store_phone: '00000'
    }])
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('storemodels', null, {});
  }
};
