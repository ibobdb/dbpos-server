const { categoryModel } = require('../models/')
const responseFormatter = require('../formatter/responseFormatter');
const Pagination = require('../utils/pagination');
const { Op } = require("sequelize");
module.exports = {
  getAll: async (req, res, next) => {
    const { limit = 10, page = 1, search } = req.query;
    try {
      const offset = (page - 1) * limit;
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                name: {
                  [Op.like]: `${search}%`
                }
              },
            ]
          }
        ]
      };
      const response = await categoryModel.findAndCountAll({
        where: (search ? whereClause : {}),
        limit: parseInt(limit),
        offset: offset
      });
      // Buat objek paginasi
      // const totalPages = Math.ceil(response.count / limit);
      // const results = {
      //   data: response.rows,
      //   currentPage: parseInt(page),
      //   totalPages: totalPages,
      //   totalItems: response.count,
      // }
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  addCategory: async (req, res, next) => {
    const data = req.body;
    try {
      const response = await categoryModel.create(data)
      if (!response) {
        res.status(400).json(responseFormatter.error('bad request'))
      }
      res.json(responseFormatter.success(response))
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  delete: async (req, res, next) => {
    const id = req.params.id;
    try {
      const response = await categoryModel.destroy({
        where: {
          id: id
        }
      });
      if (!response) {
        res.json(responseFormatter.success(response, 'Tidak ada daat ayng dihapus'))
      }
      res.json(responseFormatter.success(response, 'Data dihapus'))
    } catch (error) {
      res.status(500).json(error)
    }
  },
  update: async (req, res, next) => {
    const { name, description } = req.body;
    const id = req.params.id;
    try {
      const response = categoryModel.update({ name, description }, {
        where: {
          id: id
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
  getCategoryById: async (req, res) => {
    const id = req.params.id;
    try {
      const response = await categoryModel.findOne({
        where: {
          id: id
        }
      });
      res.json(responseFormatter.success(response))
    } catch (error) {

    }
  }
}