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
    const date = new Date();
    const tahun = date.getFullYear();
    const bulan = date.getMonth() + 1;
    const tanggal = date.getDate();
    const targetYear = req.query.tahun || 0; // Tahun yang diinginkan
    const targetMonth = req.query.bulan || 0; // Bulan yang diinginkan
    const targetDay = req.query.tanggal || 0; // Tanggal yang diinginkan
    const fulldate = `${targetDay}/${targetMonth}/${targetYear}`;
    try {
      const whereCondition = {
        createdAt: {
          [Op.and]: [
            targetYear != 0 && Sequelize.where(Sequelize.fn('YEAR', Sequelize.col('createdAt')), targetYear),
            targetMonth != 0 && Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('createdAt')), targetMonth),
            targetDay != 0 && Sequelize.where(Sequelize.fn('DAY', Sequelize.col('createdAt')), targetDay),
          ].filter(Boolean) // Filter nilai null (jika targetYear, targetMonth, atau targetDay adalah 0)
        }
      };
      const productout = await productoutmodel.findAll(
        {
          where: whereCondition,
          attributes: ['product_barcode', [Sequelize.fn('SUM', Sequelize.col('qty')), 'qty'], 'product_name', 'price', 'createdAt'],
          group: ['product_barcode', 'createdAt', 'product_name', 'price'],
        }
      );

      const data =
      {
        rowHead: [
          { header: 'Tanggal Transaksi', key: 'createdAt', width: 20 },
          { header: 'Barcode', key: 'product_barcode', width: 30 },
          { header: 'Produk', key: 'product_name', width: 30 },
          { header: 'Qty', key: 'qty', width: 20 },
          { header: 'Harga Jual', key: 'price', width: 20 },
          { header: 'Total', key: 'total', width: 20 },
        ],
        rowValue: [
        ]
      }
      productout.forEach((batch) => {
        data.rowValue.push({
          createdAt: new Date(batch.createdAt).toLocaleDateString('id-ID'),
          product_barcode: batch.product_barcode,
          product_name: batch.product_name,
          qty: batch.qty || 0,
          price: batch.price,
          total: batch.qty * batch.price
        });
      });

      const workbook_name = `Transaksi ${fulldate}`;
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