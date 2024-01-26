'use strict';
const {
  Model, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class transactionmodel extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transactionmodel.hasMany(models.productoutmodel, {
        foreignKey: 'transaction_id',
        as: 'products',
      })
    }
  }
  transactionmodel.init({
    id: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING,
      primaryKey: true,
      validate: {
        isUnique: async (val, next) => {
          try {
            const transaction = await transactionmodel.findOne({
              where: {
                id: val,
              },
            });
            if (transaction) {
              throw new Error("ID yang sama telah terdaftar");
            }
            next();
          } catch (error) {
            next(error);
          }
        },
      },
    },
    member_id: DataTypes.INTEGER,
    tax: DataTypes.INTEGER,
    discount: DataTypes.INTEGER,
    sub_total: DataTypes.INTEGER,
    total: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'transactionmodel',
    tableName: 'tb_transactions'

  });
  return transactionmodel;
};