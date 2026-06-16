import * as xlsx from 'xlsx';

async function test(url: string) {
  const res = await fetch(url);
  console.log(res.status, res.statusText);
  if (res.ok) {
        const buffer = await res.arrayBuffer();
        const workbook = xlsx.read(buffer);
        console.log(workbook.SheetNames);
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rawData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
            console.log(`URL: ${url}`);
            console.log(`Sheet: ${sheetName}`, rawData[0]);
        }
  }
}

test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/info.xlsx").catch(e => console.error(e));
