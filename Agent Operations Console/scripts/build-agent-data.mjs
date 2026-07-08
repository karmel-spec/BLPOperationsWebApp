import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const jsonPath = path.join(root, "data", "agents.json");
const outPath = path.join(root, "data", "agents-data.js");
const agents = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

if (!Array.isArray(agents)) {
  throw new Error("data/agents.json must contain an array of agents.");
}

for (const [index, agent] of agents.entries()) {
  for (const field of ["name", "role", "department", "system", "status", "email", "avatar"]) {
    if (!agent[field]) {
      throw new Error(`Agent row ${index + 1} is missing required field: ${field}`);
    }
  }
}

fs.writeFileSync(
  outPath,
  `// Generated from data/agents.json. Edit agents.json, then run node scripts/build-agent-data.mjs.\nwindow.BLP_AGENTS_DATA = ${JSON.stringify(agents, null, 2)};\n`,
);

console.log(JSON.stringify({
  agents: agents.length,
  active: agents.filter((agent) => agent.status === "Active").length,
  onDeck: agents.filter((agent) => agent.status === "On Deck").length,
  outPath,
}, null, 2));
