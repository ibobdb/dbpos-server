const { productModel, categoryModel, discountmodel, batchmodel } = require('../models/');
const responseFormatter = require('../formatter/responseFormatter');
const { Op } = require("sequelize");
const Pagination = require('../utils/pagination');
const { sync_stock } = require('../utils/syncStock');
// const categorymodel = require('../models/categorymodel');
const { createExcelFile } = require('../utils/export/excel')
module.exports = {
  getAll: async (req, res, next) => {
    // params (search, by id, by name)sort,
    const { limit = 10, page = 1, search } = req.query;
    try {
      const offset = (page - 1) * limit;
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                barcode: {
                  [Op.iLike]: `%${search}%`
                }
              },
              {
                product_name: {
                  [Op.iLike]: `%${search}%`
                }
              }
            ]
          }
        ]
      };
      const response = await productModel.findAndCountAll({
        where: (search ? whereClause : {}),
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
        include: [
          {
            model: categoryModel,
            as: 'category',
          },
          {
            model: batchmodel,
            as: 'batch_list',
            where: {
              expire_date: {
                [Op.gt]: new Date(), // Hanya memilih batch yang expire_date-nya setelah tanggal sekarang
              },
              stock: {
                [Op.gt]: 0
              }
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
          {
            model: discountmodel,
            as: 'discount',
          },
        ],
        order: [['product_name', 'ASC']]

      });
      response.rows.map(row => {
        sync_stock(row.barcode);
      })
      // Buat objek paginasi
      const totalPages = Math.ceil(response.count / limit);
      const results = {
        data: response.rows,
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalItems: response.count,
      }

      res.json(responseFormatter.success(results))
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },
  getByBarcode: async (req, res, next) => {
    const barcode = req.params.barcode;
    try {
      const response = await productModel.findOne({
        where: {
          barcode: barcode
        },
        include: [
          {
            model: discountmodel,
            as: 'discount'
          },
          {
            model: batchmodel,
            as: 'batch_list',
            where: {
              expire_date: {
                [Op.gt]: new Date(), // Hanya memilih batch yang expire_date-nya setelah tanggal sekarang
              },
              stock: {
                [Op.gt]: 0
              }
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
      if (!response) {
        return res.json(responseFormatter.error(response, 'Data tidak ditemukan'));
      }
      res.json(responseFormatter.success(response, 'Data ditemukan'));
    } catch (err) {
      res.json(responseFormatter.error(err));
    }
  },
  delete: async (req, res, next) => {
    const barcode = req.params.barcode;
    try {
      const response = await productModel.destroy({
        where: {
          barcode: barcode
        }
      })
      if (!response) {
        res.json(responseFormatter.success(response, 'Tidak ada daat ayng dihapus'))
      }
      await batchmodel.destroy({
        where: {
          product_barcode: barcode
        }
      })
      res.json(responseFormatter.success(response, 'Data dihapus'))
    } catch (err) {
      res.json(responseFormatter.error(err))
    }
  },
  post: async (req, res, next) => {
    try {
      const response = await productModel.create(req.body)
      // if(!response){
      //   res.json(responseFormatter.error)
      // }
      res.json(responseFormatter.success(response, 'Data telah disimpan'))
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        res.status(400).json({ error: 'Barcode sudah digunakan' });
      } else if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({ field: err.path, message: err.message }));
        res.status(400).json({ errors });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  },
  update: async (req, res, next) => {
    const barcode = req.params.barcode;
    try {
      const response = await productModel.update(req.body, {
        where: {
          barcode: barcode
        }
      })
      if (!response) {
        res.json(responseFormatter.error('Data gagal di update'))
      }
      res.json(responseFormatter.success(response, 'Data berhasil diupdate'))
    } catch (error) {
      res.json(responseFormatter.error(error))
    }
  },
  stock: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    const stock_limit_warning = 3;
    try {
      const offset = (page - 1) * limit;
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                product_name: {
                  [Op.iLike]: `%${search}%`
                }
              },
            ]
          },

        ]
      };
      const response = await productModel.findAndCountAll({
        where: (search ? whereClause : {
          stock: {
            [Op.lte]: stock_limit_warning
          }
        }),
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  export_to_excel: async (req, res) => {

    const getProduk = await productModel.findAll({
      include: [
        {
          model: categoryModel,
          as: 'category'
        }
      ]
    });

    const data =
    {
      rowHead: [
        { header: 'Barcode', key: 'barcode', width: 20 },
        { header: 'Produk', key: 'product_name', width: 30 },
        { header: 'Sisa Stok', key: 'stock', width: 20 },
        { header: 'kategori', key: 'category', width: 20 },
      ],
      rowValue: [
      ]
    }

    await getProduk.forEach((produk) => {
      data.rowValue.push({
        barcode: produk.barcode,
        product_name: produk.product_name,
        stock: produk.stock,
        category: produk.category ? produk.category.name : 'Tidak ada kategori',
      });
    });
    const workbook_name = `Produk Update (${new Date().toLocaleDateString('id-ID')})`;
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