import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const jsonPath = path.join(root, "data", "openclaw-mapping.json");
const outPath = path.join(root, "data", "openclaw-mapping-data.js");
const mapping = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

if (!Array.isArray(mapping)) {
  throw new Error("data/openclaw-mapping.json must contain an array.");
}

fs.writeFileSync(
  outPath,
  `// Generated from data/openclaw-mapping.json. Edit mapping JSON, then run node scripts/build-openclaw-data.mjs.\nwindow.BLP_OPENCLAW_MAPPING = ${JSON.stringify(mapping, null, 2)};\n`,
);

console.log(JSON.stringify({
  openclawAgents: mapping.length,
  readyToTest: mapping.filter((agent) => ["connected", "ready-to-test"].includes(agent.connection_status)).length,
  needsFollowUp: mapping.filter((agent) => !["connected", "ready-to-test"].includes(agent.connection_status)).length,
  outPath,
}, null, 2));
