const { productModel, stockLogModel, batchmodel } = require('../models');
const { Op } = require("sequelize");
const createStockLog = async (product_id, event, qty, desc, batch_code, user_id) => {
  try {
    const logID = await stockLogModel.create({
      product_id: product_id,
      qty: qty,
      batch_code: batch_code,
      event: event,
      desc: desc,
      user_id: user_id
    });
    if (logID) {
      updateBatchStock(product_id, batch_code, qty, event, logID.id);
    }
  } catch (error) {
    throw error
  }
}
const updateProduct = async (product_id, qty, event) => {
  try {
    const getProduct = await productModel.findOne({
      where: {
        barcode: product_id
      },
      include: [
        {
          model: batchmodel,
          as: 'batch_list',
          where: {
            expire_date: {
              [Op.gt]: new Date(), // Hanya memilih batch yang expire_date-nya setelah tanggal sekarang
            },
            stock: {
              [Op.gt]: 0
            },
            status: 1
          },
          attributes: {
            exclude: ['createdAt', 'updatedAt'],
          },
          required: false,
          separate: true,
          order: [
            ['expire_date', 'ASC']
          ]
        },
      ]
    });
    const getBatch = getProduct.batch_list[0];
    if (getProduct) {
      if (getBatch) {
        const new_stock = 0;
        console.log(getBatch.batch_code);
        //event add,subtract,update
        if (event == 'add') {
          return //add
        } else if (event == 'subtract') {
          return //subtract
        } else {
          return //update
        }
      }
    }


  } catch (error) {
    throw error
  }
}
const updateBatchStock = async (product_barcode, batch_code, qty, event, logId) => {
  try {
    const getBatch = await batchmodel.findOne({
      where: {
        product_barcode: product_barcode,
        batch_code: batch_code
      }
    })
    var changes = '';
    if (event == 'add') {
      getBatch.stock += qty
      changes = `+ ${qty}`;
    } else if (event == 'subtract') {
      getBatch.stock -= qty
      changes = `- ${qty}`;
    } else {
      const oldStock = getBatch.stock;
      const newStock = qty;
      getBatch.stock = qty
      // Cari selisih stock
      const selisihStock = newStock - oldStock;
      if (selisihStock > 0) {
        changes = `+ ${Math.abs(selisihStock)}`;
        // changes = 'bertambah';
      } else if (selisihStock < 0) {
        // changes = 'berkurang';
        changes = `- ${Math.abs(selisihStock)}`;
      } else {
        changes = 'Tidak ada perubahan';
        //asss
      }
    }
    stockLogModel.update({ changes: changes }, {
      where: {
        id: logId
      }
    })
    batchmodel.update({ stock: getBatch.stock }, {
      where: {
        batch_code: getBatch.batch_code,
        product_barcode: getBatch.product_barcode
      }
    })

  } catch (error) {

  }
}
module.exports = createStockLog;