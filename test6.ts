import * as xlsx from 'xlsx';

async function test(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const workbook = xlsx.read(buffer);
  
  for (const sheetName of workbook.SheetNames) {
    console.log("Sheet:", sheetName);
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
    console.log(JSON.stringify(rawData, null, 2));
    
    // Also try header: 1
    const rawData2 = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log("Header 1:", JSON.stringify(rawData2, null, 2));
  }
}

test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab/lab.xlsx");
