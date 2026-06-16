import * as xlsx from 'xlsx';
import fs from 'fs';

function test() {
  const file = fs.readFileSync("local_news.xlsx");
  const workbook = xlsx.read(file);
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Sheet:", sheetName);
    console.log("Headers:", rawData[0]);
    console.log("First row data:", rawData[1]);
  }
}
test();
