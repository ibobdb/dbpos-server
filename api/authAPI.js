const responseFormatter = require('../formatter/responseFormatter');
const { usermodel } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
module.exports = {
  login: async (req, res) => {
    const { password, username } = req.body;
    try {
      // chekch username
      const getuser = await usermodel.findOne({
        where: {
          username: username
        },
      })
      if (!getuser) {
        return res.json(responseFormatter.error('user tidak ditemukan'))
      }
      const comparePass = bcrypt.compareSync(password, getuser.password);
      if (!comparePass) {
        return res.json(responseFormatter.error('Password Salah'))
      }
      const token = 'Bearer ' + jwt.sign(
        {
          userId: getuser.id,
          userFullname: getuser.fullname,
          userRoles: getuser.roles
        }
        , 'secret-key', { expiresIn: 15000 });
      res.json(responseFormatter.success(
        {
          msg: 'login berhasil',
          token: token,
          data: {
            id: getuser.id,
            fullname: getuser.fullname,
            roles: getuser.roles
          }
        }
      ))
    } catch (error) {
      throw error
    }
  }
}