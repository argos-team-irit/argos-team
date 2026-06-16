import fs from "fs";

async function run() {
  const res = await fetch("https://scout.univ-toulouse.fr/pub/docs/group-lab/web/news/news.xlsx");
  if(res.ok) {
    console.log("news downloaded");
    const buffer = await res.arrayBuffer();
    fs.writeFileSync("local_news.xlsx", Buffer.from(buffer));
  } else {
    console.log("No news file", res.status);
  }
}
run();
