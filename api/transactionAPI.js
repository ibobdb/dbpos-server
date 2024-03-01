const store_transaction = require('../services/transaction/storeTransaction')
const { transactionmodel, productoutmodel } = require('../models/');
const Pagination = require('../utils/pagination');
const responseFormatter = require('../formatter/responseFormatter');
const { createExcelFile } = require('../utils/export/excel')
const { Op, Sequelize } = require("sequelize");
module.exports = {
  create: async (req, res) => {
    const transaction_data = req.body.transaction;
    const product_list = req.body.productList;
    try {
      // const create_transaction = await store_transaction(transaction_data, product_list);
      const create_transaction = await store_transaction(product_list, transaction_data);
      if (!create_transaction) {
        return res.json(responseFormatter.error(create_transaction))
      }
      res.json(responseFormatter.success(create_transaction))
    } catch (error) {

      throw (error)

    }


  },
  get: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    const whereClause = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              id: {
                [Op.iLike]: `%${search}%`
              }
            },
          ]
        }
      ]
    };
    try {
      const offset = (page - 1) * limit;
      const response = await transactionmodel.findAndCountAll({
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
        where: (search ? whereClause : {}),
        include: {
          model: productoutmodel,
          as: 'products',
        },
        order: [
          ['createdAt', 'DESC']
        ]
      })
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      throw error
    }
  },
  getTransactionById: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    try {
      const offset = (page - 1) * limit;
      const response = await transactionmodel.findOne({
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
        where: {
          id: search
        },
        include: {
          model: productoutmodel,
          as: 'products',

        }
      })
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      throw error
    }
  },
  export_to_excel: async (req, res) => {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    end.setDate(end.getDate() + 1);
    try {
      const productout = await productoutmodel.findAll(
        {
          where: {
            createdAt: {
              [Op.between]: [start, end]
            }
          }
        }
      );
      // return res.json(productout);
      const data =
      {
        rowHead: [
          { header: 'Tanggal Transaksi', key: 'createdAt', width: 20 },
          { header: 'ID TRANSAKSI', key: 'transaction_id', width: 20 },
          { header: 'Barcode', key: 'product_barcode', width: 30 },
          { header: 'Produk', key: 'product_name', width: 30 },
          { header: 'Qty', key: 'qty', width: 20 },
          { header: 'Harga Jual', key: 'price', width: 20 },
          { header: 'Total', key: 'total', width: 20 },
        ],
        rowValue: [
        ]
      }
      await productout.forEach((batch) => {
        data.rowValue.push({
          createdAt: batch.createdAt,
          transaction_id: batch.transaction_id,
          product_barcode: batch.product_barcode,
          product_name: batch.product_name,
          qty: batch.qty,
          price: batch.price,
          total: batch.total
        });
      });
      const workbook_name = `Transaksi ${start}-${end}`;
      try {
        const workbook = await createExcelFile(data);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${workbook_name}.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan saat membuat file Excel.' });
      }
    } catch (error) {
      throw error
    }
  }
}