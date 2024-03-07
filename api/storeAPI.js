const responseFormatter = require('../formatter/responseFormatter')
const { storemodel } = require('../models')
module.exports = {
  getStore: async (req, res) => {
    try {
      await storemodel.findOne({
        where: { id: 1 }
      }).then(response => {
        res.json(responseFormatter.success(response))
      })
    } catch (error) {
      throw error
    }
  },
  updateStore: async (req, res) => {
    try {
      await storemodel.update(req.body, {
        where: { id: 1 }
      }).then(response => {
        res.json(responseFormatter.success('Berhasil di ubah'))
      })
    } catch (error) {
      throw error
    }
  }

}