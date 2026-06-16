import fs from "fs";

async function run() {
  const res = await fetch("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab/lab.xlsx");
  const buffer = await res.arrayBuffer();
  fs.writeFileSync("local_lab.xlsx", Buffer.from(buffer));
  console.log("Written to local_lab.xlsx");
}
run();
