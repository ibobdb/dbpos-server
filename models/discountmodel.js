'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class discountmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      discountmodel.hasMany(models.productModel, {
        foreignKey: 'discount_id',
        as: 'product_list'
      })
    }
  }
  discountmodel.init({
    discount_name: DataTypes.STRING,
    discount_value: DataTypes.INTEGER,
    discount_start_on: DataTypes.DATE,
    discount_end_on: DataTypes.DATE,
    discount_status: DataTypes.BOOLEAN,
    discount_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'discountmodel',
    tableName: 'tb_discount'
  });
  return discountmodel;
};