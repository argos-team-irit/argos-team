import fs from 'fs';
import JSZip from 'jszip';

async function run() {
  const file = fs.readFileSync('local_lab.xlsx');
  const zip = await JSZip.loadAsync(file);
  console.log("Files in zip:");
  zip.forEach((relativePath, file) => {
    console.log(relativePath);
  });
  
  const sheet1 = zip.file("xl/worksheets/sheet1.xml");
  if (sheet1) {
    const text = await sheet1.async("text");
    console.log("Sheet 1 XML (first 1000 chars):", text.substring(0, 1000));
  }
}
run();
