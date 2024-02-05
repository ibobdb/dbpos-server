require('dotenv').config();
module.exports = {
  development: {
    username: process.env.DEVELOPMENT_DB_USER,
    password: process.env.DEVELOPMENT_DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB_NAME,
    host: process.env.DEVELOPMENT_DB_HOST,
    // port: process.env.DEVELOPMENT_DB_PORT || '3307',
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Nonaktifkan penolakan koneksi jika sertifikat SSL tidak valid
      }
    },
    dialectModule: require('pg')
  },
  production: {
    username: process.env.PRODUCTION_DB_USER,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
    host: process.env.PRODUCTION_DB_HOST,
    // port: process.env.PRODUCTION_DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Nonaktifkan penolakan koneksi jika sertifikat SSL tidak valid
      }
    },
    dialectModule: require('pg')
  },
  // ...
};