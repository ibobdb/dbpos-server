const responseFormatter = require('../formatter/responseFormatter');
const Pagination = require('../utils/pagination');
const { discountmodel, productModel } = require('../models');
const { Op } = require('sequelize');

const update_product_discount = async (discount_id, product_barcode) => {
  return await productModel.update({
    discount_id: discount_id
  }, {
    where: {
      barcode: product_barcode
    }
  });

}
const discount_expire = async () => {
  try {
    await discountmodel.findAll({
      where: {
        discount_status: true,
        discount_end_on: {
          [Op.lte]: new Date() // Diskon berakhir setelah atau pada tanggal saat ini
        }
      }
    }).then(response => {
      response.map(discount => {
        set_off_discount(discount.id);
      });
    })
    return

  } catch (error) {
    throw error
  }
}
const set_off_discount = async (discount_id) => {
  try {
    const change_status = await discountmodel.update({
      discount_status: false
    }, {
      where: {
        id: discount_id
      }
    });
    if (!change_status) {
      return 'Diskon Tidak Ditemukan';
    }
    const get_product_list = await productModel.findAll({
      where: {
        discount_id: discount_id
      }
    })
    get_product_list.map(product => {
      update_product_discount(null, product.barcode);
    })
    return
  } catch (error) {
    throw error
  }
}
module.exports = {
  create_discount: async (req, res) => {
    const data = req.body;
    try {
      const discount = await discountmodel.create(data);
      if (!discount) {
        res.json(responseFormatter.error(discount));
      }
      data.product_list.map(product_barcode => {
        update_product_discount(discount.id, product_barcode)
      });

      res.json(responseFormatter.success(discount));
    } catch (error) {
      throw error
    }
  },
  set_off_discount: async (req, res) => {
    const discount_id = req.params.id;
    try {
      const change_status = set_off_discount(discount_id);
      if (change_status) {
        res.json(responseFormatter.success('Diskon Telah Dihentikan'))
      }
    } catch (error) {
      throw error
    }
  },
  get_discount: async (req, res) => {
    const { limit = 10, page = 1, search } = req.query;
    try {
      const whereClause = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                discount_name: {
                  [Op.iLike]: `%${search}%`
                }
              },
            ]
          }
        ]
      };
      const offset = (page - 1) * limit;
      const response = await discountmodel.findAndCountAll({
        where: (search ? whereClause : {}),
        limit: parseInt(limit),
        offset: offset,
        distinct: true,
        include: [
          {
            model: productModel,
            as: 'product_list',
          }
        ],
        order: [
          ['discount_status', 'DESC']
        ]
      });
      const results = Pagination(limit, page, response)
      res.json(responseFormatter.success(results))
    } catch (error) {
      throw error
    }
  },
  check_discount_expire: async () => {
    discount_expire()
  }

}