const responseFormatter = require('../formatter/responseFormatter');
const { productModel, transactionmodel, productoutmodel } = require('../models')
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
  }
}