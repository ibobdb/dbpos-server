'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class batchmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      batchmodel.belongsTo(models.productModel, {
        foreignKey: 'product_barcode',
        targetKey: 'barcode',
        as: 'product'
      })
    }
  }
  batchmodel.init({
    batch_code: DataTypes.STRING,
    expire_date: DataTypes.DATE,
    product_barcode: DataTypes.STRING,
    stock: DataTypes.INTEGER,
    status: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'batchmodel',
    tableName: 'tb_batch'
  });
  return batchmodel;
};