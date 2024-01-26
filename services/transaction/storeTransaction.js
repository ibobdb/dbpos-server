const { transactionmodel, productoutmodel, productModel, batchmodel } = require('../../models');
const { Op } = require("sequelize");
const StockLog = require('../../utils/stock')

const generateTransactionId = () => {
  try {
    const date = new Date();
    const datePref = `${date.getFullYear()}${date.getMonth()}`;
    const getRandomInt = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return `${datePref}${getRandomInt(1, 50)}${getRandomInt(51, 100)}${getRandomInt(1, 1000)}${getRandomInt(1000, 2000)}`
  } catch (error) {
    console.error('Error Transaction ID:', error);
    throw error;
  }
}
const getProductData = async (barcode) => {
  try {
    const response = await productModel.findOne({
      where: {
        barcode: barcode
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
            status: true
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
    return response ? response.toJSON() : null;
  } catch (error) {
    throw error
  }
}
const store_product_out = async (product_list, transaction_id) => {
  try {
    product_list = await Promise.all(product_list.map(async product => {
      const dataProduct = await getProductData(product.product_barcode);
      // Pastikan data produk ditemukan sebelum menggunakan
      if (dataProduct && dataProduct.product_name) {
        const diskon = dataProduct.price - (dataProduct.price * product.discount / 100)
        const total = product.qty * diskon;
        return {
          ...product,
          transaction_id: transaction_id,
          product_name: dataProduct.product_name,
          batch_list: dataProduct.batch_list,
          price: dataProduct.price,
          cost: dataProduct.cost,
          total: total
        };
      } else {
        // Handle jika data produk tidak ditemukan
        console.error(`Data produk tidak ditemukan untuk barcode: ${product.product_barcode}`);
        return null;
      }
    }));
    const insert_list = await productoutmodel.bulkCreate(product_list);
    if (insert_list) {
      // Setelah transaksi berhasil tambahkan stock log
      // Stock log tidak melakukan pengurangan terhadap stock
      product_list.map((obj, i) => {
        // StockLog(obj.product_barcode, 'subtract', obj.qty, 'TRANSAKSI', obj.batch_list[0].batch_code);
        var allqty = obj.qty; //yang dimasukan 3 stok awal 2
        for (const batch of obj.batch_list) {
          const check_stock = batch.stock - allqty; //5-6 = -1 // iterasi kedua allqty =1
          if (check_stock < 0) {
            StockLog(obj.product_barcode, 'subtract', batch.stock, 'TRANSAKSI', batch.batch_code);
            allqty -= batch.stock //sisa 1
          } else {
            StockLog(obj.product_barcode, 'subtract', allqty, 'TRANSAKSI', batch.batch_code);
            // console.log('masuk ke btach kedua')
            break;
          }
        }
      })
    }
    const sumTotal = product_list.reduce((acc, product) => acc + product.total, 0);
    return sumTotal
  } catch (error) {
    throw (error)
  }
}
const store_transaction = async (product_list, transaction_data) => {
  if (product_list.length <= 0 || product_list == undefined || product_list == null) {
    return 'Produk List Kosong'
  }
  const id = generateTransactionId();
  const data = {
    id: id,
    member_id: transaction_data.member_id,
    tax: transaction_data.tax,
    discount: transaction_data.discount,
    sub_total: 0,
    total: 0
  }
  try {
    const create_product_out = await store_product_out(product_list, id);
    const discount = data.discount;
    const tax = data.tax;
    const subtotal = create_product_out
    const total = (subtotal - (subtotal * discount / 100) + (subtotal * tax / 100));
    data.sub_total = subtotal;
    data.total = total;
    const create_transaction = await transactionmodel.create(data);
    if (create_transaction) {
      return create_transaction;
    }
  } catch (error) {
    throw error
  }

}
module.exports = store_transaction;
