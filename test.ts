import * as xlsx from 'xlsx';

async function test() {
  const res = await fetch("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/projects/projects.xlsx");
  const buffer = await res.arrayBuffer();
  const workbook = xlsx.read(buffer);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
  console.log(JSON.stringify(rawData, null, 2));
}

test();
