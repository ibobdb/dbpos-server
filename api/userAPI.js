// create user, get user, edit user
const responseFormatter = require('../formatter/responseFormatter');
const Pagination = require('../utils/pagination');
const { Op } = require("sequelize");
const { usermodel } = require('../models')
const bcrypt = require('bcryptjs');
module.exports = {
  create: async (req, res) => {
    const data = req.body;
    try {
      const checkUsername = await usermodel.findOne({
        where: {
          username: data.username
        }
      })
      if (checkUsername) {
        return res.json(responseFormatter.error('Username telah terdafatar'));
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);
      data.password = hashedPassword;
      const createData = await usermodel.create(data);
      if (!createData) {
        return res.status(400).json(responseFormatter.error('bad request'))
      }
      return res.json(responseFormatter.success(createData));
    } catch (error) {
      throw error
    }

  },
  get: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    try {
      const offset = (page - 1) * limit;
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                fullname: {
                  [Op.like]: `${search}%`
                }
              }, {
                roles: {
                  [Op.like]: `${search}%`
                }
              },
              {
                username: {
                  [Op.like]: `${search}%`
                }
              },
            ]
          }
        ]
      };
      const response = await usermodel.findAndCountAll({
        where: (search ? whereClause : {}),
        limit: parseInt(limit),
        offset: offset
      });

      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  update: async (req, res) => {

  },
  delete: async (req, res) => {
    const id = req.params.id;
    try {
      const response = await usermodel.destroy({
        where: {
          id: id
        }
      })
      res.json(responseFormatter.success(response, 'Data dihapus'))
    } catch (err) {
      res.json(responseFormatter.error(err))
    }
  },
  getUserByID: async (req, res) => {
    const userId = req.params.id;
    try {
      await usermodel.findOne({
        where: {
          id: userId
        }
      }).then((response) => {
        res.json(responseFormatter.success(response))
      })
    } catch (error) {
      throw error
    }
  }
}