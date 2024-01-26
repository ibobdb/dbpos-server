// excelExport.js

const ExcelJS = require('exceljs');

async function createExcelFile(data) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  worksheet.columns = data.rowHead;

  data.rowValue.forEach((row) => {
    worksheet.addRow(row);
  });

  return workbook;
}

module.exports = { createExcelFile };