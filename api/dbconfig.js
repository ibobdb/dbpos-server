const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
module.exports = {
  getConfig: async (req, res) => {
    // Baca konfigurasi dari file JSON

    try {
      const configPath = path.join(__dirname, '../config/config.json');
      const rawConfig = fs.readFileSync(configPath);
      const config = JSON.parse(rawConfig);
      const devConfig = config.development;
      res.json(devConfig)
      // res.json(configPath)
    } catch (error) {
      throw (error)
    }
    // const db = mysql.createPool(
    //   {
    //     host: devConfig.host,
    //     user: devConfig.username, // Ganti dengan nama pengguna MySQL Anda
    //     password: devConfig.password, // Ganti dengan kata sandi MySQL Anda
    //     database: devConfig.database, // Ganti dengan nama database Anda
    //     port: devConfig.port,
    //     waitForConnections: true,
    //     connectionLimit: 10,
    //     queueLimit: 0,
    //   }
    // );
    // console.log(devConfig.database)

    // try {
    //   // Jalankan query
    //   const [rows, fields] = await db.execute('SELECT 1');
    //   res.json({ success: true, message: 'Connection to MySQL successful!' });
    // } catch (error) {
    //   console.error('Error executing query:', error.message);
    //   res.status(500).json({ success: false, error: error.message });
    // }

  },
  updateConfig: async (req, res) => {
    const fs = require('fs');
    const path = require('path');

    const configPath = path.join(__dirname, '../config/config.json');
    const rawConfig = fs.readFileSync(configPath);
    const config = JSON.parse(rawConfig);
    const newConfig = req.body;
    // res.send(config);

    // Update nilai 'password'
    config.development = newConfig;
    config.development.dialect = 'mysql'

    // // Simpan konfigurasi kembali ke file
    const updatedConfig = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, updatedConfig);
    res.json({
      message: 'Config Updated'
    })
    // console.log('File konfigurasi berhasil diperbarui.');
  },
  connection: async (req, res) => {
    const devConfig = req.query;
    const db = mysql.createPool(
      {
        host: devConfig.host,
        user: devConfig.username, // Ganti dengan nama pengguna MySQL Anda
        password: devConfig.password, // Ganti dengan kata sandi MySQL Anda
        database: devConfig.database, // Ganti dengan nama database Anda
        port: devConfig.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      }
    );
    try {
      const [rows, fields] = await db.execute('SELECT 1');
      res.json({ success: true, message: 'Connection to MySQL successful!' });
    } catch (error) {
      console.error('Error executing query:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}