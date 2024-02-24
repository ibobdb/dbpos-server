const { stockLogModel } = require('../models');
const responseFormatter = require('../formatter/responseFormatter');

module.exports = {
  getProductStockLog: async (req, res) => {
    const barcode = req.params.barcode;
    try {
      const response = await stockLogModel.findOne({
        where: {
          product_id: barcode
        }
      });
      if (!response) {
        return res.json(responseFormatter.error(response, 'Data tidak ditemukan'));
      }
      res.json(responseFormatter.success(response, 'Data ditemukan'));
    } catch (err) {
      res.json(responseFormatter.error(err));
    }
  },
}