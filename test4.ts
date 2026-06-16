import * as xlsx from 'xlsx';

async function test(url: string) {
  const res = await fetch(url);
  console.log(`URL: ${url} -> Status: ${res.status}`);
}

test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab/lab.xlsx");
test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab.xlsx");
test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/info.xlsx");
test("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/equipe/equipe.xlsx");
