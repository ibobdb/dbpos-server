const { batchmodel, productModel } = require("../models/");

const { Op } = require("sequelize");
module.exports = {
  sync_stock: async (product_barcode) => {
    const batch_list = await batchmodel.findAll({
      where: {
        expire_date: {
          [Op.gt]: new Date(),
        },
        product_barcode: product_barcode
      },
    })
    const totalStock = batch_list.reduce((accumulator, batch) => accumulator + batch.stock, 0);
    await productModel.update({
      stock: totalStock
    }, {
      where: {
        barcode: product_barcode
      }
    })
    return
  }
}