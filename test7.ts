import fs from 'fs';
const stats = fs.statSync("local_lab.xlsx");
console.log("Size:", stats.size);
