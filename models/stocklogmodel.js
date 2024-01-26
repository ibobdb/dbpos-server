'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class stockLogModel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  stockLogModel.init({
    product_id: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    event: DataTypes.STRING,
    desc: DataTypes.STRING,
    batch_code: DataTypes.STRING,
    changes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'stockLogModel',
    tableName: 'tb_stock_log'
  });
  return stockLogModel;
};