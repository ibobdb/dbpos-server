const responseFormatter = require('../formatter/responseFormatter');
const { productModel, transactionmodel, productoutmodel, categoryModel } = require('../models')
const { Op, Sequelize } = require("sequelize");
module.exports = {
  non_filter_data: async (req, res) => {
    try {
      const product = await productModel.findAndCountAll();
      const data = {
        'total_produk': product.count,
        'total_member': 0,
        'total_diskon_aktif': 0,
        'tanggal': new Date()
      }
      res.json(responseFormatter.success(data));
    } catch (error) {
      throw error
    }
  },
  top_member: async (req, res) => {
    try {
      const data = [
        {
          name: 'Boby Nurgraha',
          point: 1000
        }
      ]
      res.json(responseFormatter.success(data))
    } catch (error) {
      throw error
    }
  },
  filter_data: async (req, res) => {
    const date = new Date();
    const tahun = date.getFullYear();
    const bulan = date.getMonth() + 1;
    const tanggal = date.getDate();
    const targetYear = req.query.tahun || tahun; // Tahun yang diinginkan
    const targetMonth = req.query.bulan || bulan; // Bulan yang diinginkan
    const targetDay = req.query.tanggal || tanggal; // Tanggal yang diinginkan
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
      const total_transaksi = await transactionmodel.findAndCountAll({
        where: whereCondition
      });
      const total_kotor = await transactionmodel.sum('total', {
        where: whereCondition
      });
      const total_cost = await productoutmodel.sum('cost', {
        where: whereCondition
      });
      const total_bersih = total_kotor - total_cost;
      const data = {
        total_transaksi: total_transaksi.count,
        revenue_kotor: total_kotor || 0,
        revenue_bersih: total_bersih
      }
      res.json(responseFormatter.success(data));
    } catch (error) {
      throw error
    }
  },
  getDashboard: async (req, res) => {

    const start = new Date(req.query.start);
    const end = new Date(req.query.end);
    end.setDate(end.getDate() + 1);
    const whereClause = {
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      }
    }
    const transaction = await transactionmodel.findAndCountAll(whereClause);
    const sales = await transactionmodel.sum('total', whereClause);
    const product_sales = await productoutmodel.findAndCountAll(whereClause);
    const cost = await await productoutmodel.findAll({
      attributes: [
        [Sequelize.literal('SUM(cost * qty)'), 'total'] // Ekspresi SQL untuk menghitung total cost
      ],
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      }
    })
    const top_product = await productoutmodel.findAll({
      attributes: ['product_name', [Sequelize.fn('SUM', Sequelize.col('qty')), 'total']],
      group: ['product_name'],
      order: [[Sequelize.literal('total'), 'DESC']],
      limit: 10,
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      }
    })
    // ALL SALES
    const all_sales = await transactionmodel.findAll({
    });
    // Top Sales
    const top_sales = await productoutmodel.findAll({
      attributes: ['product_name', [Sequelize.fn('SUM', Sequelize.col('total')), 'total']],
      group: ['product_name'],
      order: [[Sequelize.literal('total'), 'DESC']],
      limit: 10,
      where: {
        createdAt: {
          [Op.between]: [start, end]
        }
      }
    }).then(response => {
      const total_penjualan = sales;
      const addKontribusi = response.map(item => {
        const kontribusi = Math.round((item.total / total_penjualan) * 100);
        return { ...item.dataValues, kontribusi: kontribusi };
      });
      return addKontribusi
    })
    const yearToSearch = new Date().getFullYear() - 1;
    const compare_year = await productoutmodel.findAll({
      attributes: [
        [Sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), 'tahun'],
        [Sequelize.literal('SUM(cost * qty)'), 'total_cost'],
        [Sequelize.literal('SUM(total)'), 'total_price'],
      ],
      group: [Sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), 'tahun'],
      where: Sequelize.where(
        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "createdAt"')),
        {
          [Op.gte]: yearToSearch
        }
      ),
      order: [
        [Sequelize.literal('EXTRACT(YEAR FROM "createdAt")'), 'ASC']
      ]
    }).then(response => {
      const margin = response.map(item => {
        return {
          tahun: item.dataValues.tahun,
          total_cost: parseInt(item.dataValues.total_cost),
          total_sale: parseInt(item.dataValues.total_price),
          margin: item.dataValues.total_price - item.dataValues.total_cost
        }
      })
      return margin
    })


    const data = {
      total_sales: sales || 0,
      compare_year: compare_year,
      total_transaction: transaction.count || 0,
      total_product_sales: product_sales.count,
      total_cost: cost || 0,
      top_product: top_product || [],
      all_sales: all_sales,
      top_sales: top_sales || [],

    }
    return res.json(responseFormatter.success(data))
  },
  getStat: async (req, res) => {
    const yearToSearch = req.query.year;
    const comparePerYear = await productoutmodel.findAll({
      attributes: [
        [Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month'], // Extract month from createdAt column
        [Sequelize.literal('SUM(cost * qty)'), 'total_cost'], // Calculate total cost
        [Sequelize.literal('SUM(total)'), 'total_price'], // Calculate total price
      ],
      group: [Sequelize.literal('EXTRACT(MONTH FROM "createdAt")'), 'month'],
      where: Sequelize.where(
        Sequelize.fn('EXTRACT', Sequelize.literal('YEAR FROM "createdAt"')),
        yearToSearch
      ),
    }).then(response => {
      const margin = response.map(item => {
        return {
          bulan: item.dataValues.month,
          total_cost: parseInt(item.dataValues.total_cost),
          total_sale: parseInt(item.dataValues.total_price),
          margin: item.dataValues.total_price - item.dataValues.total_cost
        }
      })
      return margin
    })
    res.json(responseFormatter.success(comparePerYear))
  }
}