var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.get("/api/proxy-json", async (req, res) => {
    const jsonUrl = req.query.url;
    if (!jsonUrl || typeof jsonUrl !== "string") {
      return res.status(400).json({ error: 'Missing or invalid "url" query parameter' });
    }
    try {
      const response = await fetch(jsonUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json, text/plain, */*"
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const rawText = await response.text();
      let data = {};
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        try {
          const lines = rawText.split("\n");
          lines.forEach((line) => {
            const colonIdx = line.indexOf(":");
            if (colonIdx > -1) {
              let key = line.substring(0, colonIdx).replace(/["{}\s]/g, "").trim();
              let val = line.substring(colonIdx + 1).replace(/(^["\s]*)|(["\s,]*$)/g, "").trim();
              if (key) {
                data[key] = val;
              }
            }
          });
          if (Object.keys(data).length === 0) throw new Error("Empty parsed data");
        } catch (e2) {
          throw new Error("Could not extract any data from malformed JSON");
        }
      }
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    } catch (err) {
      try {
        const { get } = require("https");
        const { parse } = require("url");
        const options = Object.assign({}, parse(jsonUrl), {
          headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json, text/plain, */*" },
          rejectUnauthorized: false
        });
        get(options, (fallbackRes) => {
          let rawData = "";
          fallbackRes.on("data", (c) => rawData += c);
          fallbackRes.on("end", () => {
            try {
              res.setHeader("Access-Control-Allow-Origin", "*");
              res.json(JSON.parse(rawData || "{}"));
            } catch (e) {
              res.status(500).json({ error: "Parse Error" });
            }
          });
        }).on("error", (e) => res.status(500).json({ error: `HTTPS error: ${e.message}` }));
      } catch (fallbackErr) {
        return res.status(500).json({ error: err.message });
      }
    }
  });
  app.get("/api/proxy-xlsx", async (req, res) => {
    const xlsxUrl = req.query.url;
    if (!xlsxUrl || typeof xlsxUrl !== "string") {
      return res.status(400).json({ error: 'Missing or invalid "url" query parameter' });
    }
    try {
      console.log(`[Proxy] Fetching remote spreadsheet from: ${xlsxUrl}`);
      const response = await fetch(xlsxUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*"
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch HTTP ${response.status} from ${xlsxUrl}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = response.headers.get("content-type") || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(buffer);
    } catch (err) {
      console.error(`Proxy Error fetching ${xlsxUrl}:`, err.message);
      try {
        console.log(`[Proxy] Attempting fallback fetch via https module for ${xlsxUrl}`);
        const { get } = require("https");
        const { parse } = require("url");
        const options = Object.assign({}, parse(xlsxUrl), {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, */*"
          },
          rejectUnauthorized: false
        });
        get(options, (fallbackRes) => {
          if (fallbackRes.statusCode === 301 || fallbackRes.statusCode === 302) {
            console.error("[Proxy Fallback] Redirects currently unhandled in fallback");
            return res.status(500).json({ error: "Fallback proxy failed on redirect" });
          }
          if (fallbackRes.statusCode !== 200) {
            return res.status(fallbackRes.statusCode || 500).json({ error: `Fallback failed: ${fallbackRes.statusCode}` });
          }
          const chunks = [];
          fallbackRes.on("data", (c) => chunks.push(c));
          fallbackRes.on("end", () => {
            const buf = Buffer.concat(chunks);
            const ct = fallbackRes.headers["content-type"] || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            res.setHeader("Content-Type", ct);
            res.setHeader("Content-Disposition", 'attachment; filename="data.xlsx"');
            res.setHeader("Access-Control-Allow-Origin", "*");
            return res.send(buf);
          });
          fallbackRes.on("error", (e) => {
            return res.status(500).json({ error: e.message });
          });
        }).on("error", (e) => {
          return res.status(500).json({ error: `HTTPS error: ${e.message}` });
        });
      } catch (fallbackErr) {
        return res.status(500).json({ error: `Proxy Error & Fallback Error: ${err.message}` });
      }
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server seamlessly running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
