import fs from 'fs';
const buf = fs.readFileSync("local_lab.xlsx");
console.log(buf.toString('utf-8').substring(0, 500));
