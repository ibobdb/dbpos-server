'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productoutmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      productoutmodel.belongsTo(models.productModel, {
        foreignKey: 'product_barcode',
        targetKey: 'barcode',
        as: 'product'
      });
    }
  }
  productoutmodel.init({
    transaction_id: {
      allowNull: false,
      type: DataTypes.STRING
    },
    product_barcode: {
      allowNull: false,
      primaryKey: false,
      type: DataTypes.STRING
    },
    product_name: DataTypes.STRING,
    price: DataTypes.INTEGER,
    cost: DataTypes.INTEGER,
    qty: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    discount_desc: DataTypes.STRING,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'productoutmodel',
    tableName: 'tb_product_out'
  });
  return productoutmodel;
};