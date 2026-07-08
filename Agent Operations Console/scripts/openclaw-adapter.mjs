import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const mappingPath = path.join(root, "data", "openclaw-mapping.json");
const statusPath = path.join(root, "data", "agent-status.json");
const cronPath = path.join(root, "data", "cron-inventory.json");

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeStatus(agent) {
  const readyForTest = ["connected", "ready-to-test"].includes(agent.connection_status);
  return {
    name: agent.name,
    system: "OpenClaw",
    openclaw_id: agent.openclaw_id,
    connectionStatus: agent.connection_status || "needs-details",
    health: readyForTest ? "Ready for connection test" : agent.status_endpoint || agent.activity_source ? "Needs follow-up" : "Unknown",
    currentWork: [],
    blocker: readyForTest ? null : "Awaiting verified OpenClaw endpoint, CLI, webhook, auth, or safe test details.",
    lastSeen: null,
    statusSource: agent.status_endpoint || agent.activity_source || null,
    taskEndpoint: agent.task_endpoint || null,
  };
}

function normalizeCron(agent) {
  const readyForTest = ["connected", "ready-to-test"].includes(agent.connection_status);
  return {
    agent: agent.name,
    system: "OpenClaw",
    openclaw_id: agent.openclaw_id,
    connectionStatus: agent.connection_status || "needs-details",
    jobs: [],
    source: agent.cron_source || null,
    nextAction: readyForTest
      ? "Run a safe read-only cron/status parser test."
      : agent.cron_source
      ? "Implement parser for this cron source."
      : "Ask agent for cron source, schedule list, last-run log, and failure behavior.",
  };
}

function buildSnapshot() {
  const mapping = readJson(mappingPath, []);
  const openclawAgents = mapping.filter((agent) => agent.connection_status !== "disabled");
  writeJson(statusPath, openclawAgents.map(normalizeStatus));
  writeJson(cronPath, openclawAgents.map(normalizeCron));
  return {
    generatedAt: new Date().toISOString(),
    openclawAgents: openclawAgents.length,
    readyToTest: openclawAgents.filter((agent) => ["connected", "ready-to-test"].includes(agent.connection_status)).length,
    needsFollowUp: openclawAgents.filter((agent) => !["connected", "ready-to-test"].includes(agent.connection_status)).length,
    outputs: {
      statusPath,
      cronPath,
    },
  };
}

console.log(JSON.stringify(buildSnapshot(), null, 2));
