'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class storemodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  storemodel.init({
    store_name: DataTypes.STRING,
    store_address: DataTypes.STRING,
    store_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'storemodel',
    timestamps: false
  });
  return storemodel;
};