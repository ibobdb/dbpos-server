const express = require('express')
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
// Middleware untuk mengurai data JSON dan formulir URL-encoded
require('dotenv').config();
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self' http://127.0.0.1:8080;");
  next();
});
const PORT = process.env.SERVER_PORT;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.get('/api/v1', (req, res) => {
  res.send('Server Running')
})
// Middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  if (token.split(' ')[0] !== 'Bearer') {
    return res.status(500).send({
      auth: false,
      message: "Error",
      errors: "Incorrect token format"
    });
  }
  let tokensplit = token.split(' ')[1];
  if (!tokensplit) {
    return res.status(403).send({
      auth: false,
      message: "Error",
      errors: "No token provided"
    });
  }
  jwt.verify(tokensplit, 'secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}
// Database Setting
const dbConfig = require('./api/dbconfig');
app.get('/api/v1/db-setting', dbConfig.getConfig)
app.post('/api/v1/db-setting/update', dbConfig.updateConfig)
app.get('/api/v1/db-setting/connection', dbConfig.connection)
// Produk API
const product = require('./api/productAPI');
app.get('/api/v1/product/', product.getAll);
app.get('/api/v1/product/:barcode', product.getByBarcode);
app.delete('/api/v1/product/:barcode', product.delete);
app.post('/api/v1/product/', product.post);
app.put('/api/v1/product/:barcode', product.update);

// Category API
const category = require('./api/categoryAPI')
app.get('/api/v1/category', category.getAll)
app.post('/api/v1/category', category.addCategory)
app.delete('/api/v1/category/:id', category.delete)
app.put('/api/v1/category/:id', category.update)
// transaksi
const transaction = require('./api/transactionAPI')
app.post('/api/v1/transaction', transaction.create);
app.get('/api/v1/transaction', transaction.get);
// app.get('/api/v1/transaction', transaction.getTransactionById);
app.get('/api/v1/transaction/export/excel', transaction.export_to_excel)
// Dashboard
const dashboard = require('./api/dashboardAPI');
app.get('/api/v1/dashboard/non_filter_data', dashboard.non_filter_data);
app.get('/api/v1/dashboard/filter_data', dashboard.filter_data);
// DISKON
const discount = require('./api/discountAPI');
discount.check_discount_expire();
app.get('/api/v1/discount', discount.get_discount);
app.post('/api/v1/discount', discount.create_discount);
app.put('/api/v1/discount/change_status/:id', discount.set_off_discount);
// Batch
const batch = require('./api/batchAPI');
batch.check_bath_expire();
app.get('/api/v1/batch', batch.get);
app.get('/api/v1/batch/:batch_code', batch.getById);
app.post('/api/v1/batch', batch.create);
app.put('/api/v1/batch', batch.update);
app.delete('/api/v1/batch/:batch_code', batch.delete);
app.put('/api/v1/batch/:batch_code', batch.adjust_batch_stock);
app.get('/api/v1/batch/export/excel', batch.export_to_excel);

// User
const user = require('./api/userAPI');
app.get('/api/v1/users', user.get);
app.post('/api/v1/users', user.create);
app.delete('/api/v1/users/:id/delete', user.delete);
app.put('/api/v1/users/:id/update', user.update);
// AUTh
const auth = require('./api/authAPI')
app.post('/api/v1/login', auth.login);

// const export = require('./api/export/excel');
// Export

app.listen(PORT, () => {
  console.log(`Server dijalankan pada port:${PORT}`)
})