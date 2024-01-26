'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class productModel extends Model {
    static associate(models) {
      // define association here
      productModel.belongsTo(models.categoryModel, {
        foreignKey: 'category_id',
        as: 'category'
      });
      productModel.belongsTo(models.discountmodel, {
        foreignKey: 'discount_id',
        as: 'discount'
      });
      productModel.hasMany(models.batchmodel, {
        foreignKey: 'product_barcode',
        sourceKey: 'barcode',
        as: 'batch_list',
      })
    }
  }
  productModel.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isUnique: async (val, next) => {
          try {
            const product = await productModel.findOne({
              where: {
                barcode: val,
              },
            });
            if (product) {
              throw new Error("Barcode telah terdafter");
            }
            next();
          } catch (error) {
            next(error);
          }
        },
      },
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: "Name cannot be null",
        },
      },
    },
    cost: DataTypes.INTEGER,
    price: DataTypes.INTEGER,
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "READY",
    },
    isRetail: {
      type: DataTypes.BOOLEAN,
      defaultValue: 1,
    },
    category_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    discount_id: {
      type: DataTypes.INTEGER,

    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // supplier_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'productModel',
    tableName: 'tb_products',
  });
  return productModel;
};