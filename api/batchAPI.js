const responseFormatter = require("../formatter/responseFormatter");
const { batchmodel, productModel } = require("../models")
const { Op } = require("sequelize");
const Pagination = require('../utils/pagination');
const { sync_stock } = require("../utils/syncStock");
const StockLog = require('../utils/stock');
const { createExcelFile } = require('../utils/export/excel')
module.exports = {
  get: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    const whereClause = {
      [Op.and]: [
        {
          [Op.or]: [
            {
              batch_code: {
                [Op.like]: `%${search}%`
              }
            },
            {
              product_barcode: {
                [Op.like]: `%${search}%`
              }
            },
            {
              '$product.product_name$': {
                [Op.like]: `%${search}%`
              }
            }
          ]
        }
      ]
    };
    try {
      const offset = (page - 1) * limit;
      const response = await batchmodel.findAndCountAll({
        where: (search ? whereClause : {}),
        offset: parseInt(offset),
        limit: parseInt(limit),
        include: [
          {
            model: productModel,
            as: 'product',
            order: [
              ['product_name', 'ASC']
            ]
          }
        ],

      });
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      throw error
    }
  },
  create: async (req, res) => {
    const data = req.body;
    try {
      // Checlk Tanggal
      const check_expire = new Date(data.expire_date) <= new Date()
      data.status = check_expire ? false : true
      const response = await batchmodel.create(data);
      if (response) {
        // Sinkronkan Total STOK
        await sync_stock(data.product_barcode);
      }
      res.json(responseFormatter.success(response));
    } catch (error) {
      throw error
    }
  },
  getById: async (req, res) => {
    const batch_code = req.params.batch_code;
    try {
      const response = await batchmodel.findOne({
        where: {
          batch_code: batch_code
        }
      });
      if (!response) {
        res.json(responseFormatter.success('Batch Tidak ditemukan'))
      }
      res.json(responseFormatter.success(response));
    } catch (error) {

    }
  },
  update: async (req, res) => {
    const batch_code = req.params.batch_code;
    const data = req.body;
    try {
      const response = await batch_code.update(data, {
        where: {
          batch_code: batch_code
        }
      })
    } catch (error) {
    }
  },
  delete: async (req, res) => {
    const batch_code = req.params.batch_code;
    try {
      const response = await batchmodel.destroy({
        where: {
          batch_code: batch_code
        }
      })
      res.json(responseFormatter.success(response))
    } catch (error) {
    }
  },
  check_bath_expire: async () => {
    try {
      await batchmodel.findAll(
        {
          where: {
            expire_date: {
              [Op.lte]: new Date()
            },
            status: true
          }
        }
      ).then(response => {
        response.map((item) => {
          batchmodel.update({
            status: false
          }, {
            where: {
              batch_code: item.batch_code
            }
          })
        })

      })
      return
    } catch (error) {
      throw error
    }
  },
  adjust_batch_stock: async (req, res) => {
    const batch_code = req.params.batch_code;
    const new_stock = req.body.new_stock;
    try {
      const getBarcode = await batchmodel.findOne({
        where: {
          batch_code: batch_code
        }
      });
      if (getBarcode) {


        StockLog(getBarcode.product_barcode, 'update', new_stock, 'UPDATE BATCH', batch_code);
      }
      res.json(responseFormatter.error('batch tidak ditemukan'))

    } catch (error) {

    }
  },
  export_to_excel: async (req, res) => {
    const getBatch = await batchmodel.findAll({
      include: [
        {
          model: productModel,
          as: 'product',
          order: [
            ['product_name', 'ASC']
          ]
        }
      ],
    });
    const data =
    {
      rowHead: [
        { header: 'Nomor Batch', key: 'batch_code', width: 20 },
        { header: 'Produk', key: 'product_name', width: 30 },
        { header: 'Sisa Stok', key: 'stok', width: 20 },
        { header: 'Tanggal Expire', key: 'expire_date', width: 20 },
      ],
      rowValue: [
      ]
    }
    getBatch.forEach((batch) => {
      data.rowValue.push({
        batch_code: batch.batch_code,
        product_name: batch.product.product_name,
        stok: batch.stock,
        expire_date: batch.expire_date,
      });
    });
    const workbook_name = `Batch ${new Date().toLocaleDateString('id-ID')}`;
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
  }

}