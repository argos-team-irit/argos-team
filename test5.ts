import * as xlsx from 'xlsx';

async function test(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const workbook = xlsx.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(JSON.stringify(rawData[0], null, 2));
}

test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab/lab.xlsx");
