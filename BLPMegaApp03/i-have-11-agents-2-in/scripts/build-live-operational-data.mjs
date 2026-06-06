import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const outPath = path.join(dataDir, "live-operational-data.js");

function readJson(fileName, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, fileName), "utf8")) ?? fallback;
  } catch {
    return fallback;
  }
}

function readJsonl(fileName) {
  try {
    return fs
      .readFileSync(path.join(dataDir, fileName), "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function readBackupSources() {
  const file = path.join(dataDir, "agent-backup-sources-data.js");
  try {
    const text = fs.readFileSync(file, "utf8");
    return JSON.parse(text.match(/= (.*);/s)[1]);
  } catch {
    return readJson("agent-backup-sources.json", []);
  }
}

function isSmokeTest(item) {
  const text = `${item.title || ""} ${item.summary || ""} ${item.source || ""}`.toLowerCase();
  return text.includes("smoke test") || text.includes("codex verification");
}

function formatTime(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function connectionFor(agent, statusRows, backupRows) {
  const status = statusRows.find((row) => row.name === agent.name);
  const backup = backupRows.find((row) => row.name === agent.name);
  const statusFileFound = Boolean(backup?.statusFileMeta?.exists);
  const backupKnown = Boolean(backup?.backupFolderUrl || backup?.localSyncPath);
  const openClawReady = ["connected", "ready-to-test"].includes(status?.connectionStatus);

  if (statusFileFound) {
    return {
      status: "Ready",
      trend: "Stable",
      load: "Live backup status file connected",
      blocker: "None",
      score: 95,
      checkIn: formatTime(backup.statusFileMeta.modifiedAt),
      lastAction: "Nightly backup status file detected",
    };
  }

  if (backupKnown) {
    return {
      status: "Watch",
      trend: "Stable",
      load: "Backup folder connected",
      blocker: "Waiting for STATUS.md in nightly backup",
      score: 72,
      checkIn: "Awaiting next backup",
      lastAction: "Backup folder linked",
    };
  }

  if (openClawReady) {
    return {
      status: "Watch",
      trend: "Stable",
      load: "Connection details collected",
      blocker: "Waiting for backup folder or live status feed",
      score: 68,
      checkIn: "No live check-in yet",
      lastAction: "OpenClaw connection details received",
    };
  }

  return {
    status: "Guarded",
    trend: "Stable",
    load: "No live operational feed connected",
    blocker: status?.blocker || "Need backup folder, status file, or live connector",
    score: 40,
    checkIn: "Not connected",
    lastAction: "Awaiting live data source",
  };
}

const agents = readJson("agents.json", []).filter((agent) => agent.status === "Active");
const workQueue = readJson("work-queue.json", []).filter((item) => !isSmokeTest(item));
const approvals = readJson("approvals.json", []).filter((item) => !isSmokeTest(item));
const audit = readJsonl("audit-log.jsonl").filter((item) => !isSmokeTest(item.payload || item));
const statusRows = readJson("agent-status.json", []);
const cronRows = readJson("cron-inventory.json", []);
const backupRows = readBackupSources();

const tasks = workQueue.map((item) => ({
  title: item.title,
  owner: item.agent,
  type: item.type || "Work queue",
  status: item.status,
  summary: item.summary || item.nextStep || "Live queue item.",
}));

const approvalItems = approvals.map((item) => ({
  type: item.type || item.mode || "Approval",
  owner: item.agent || item.owner || "Unassigned",
  risk: item.risk || "Medium",
  status: item.status || "Needs approval",
  title: item.title || "Approval packet",
  summary: item.summary || item.comment || "Live approval packet.",
  before: item.before || "Pending live source preview.",
  after: item.after || "Pending human review decision.",
  source: item.source || "Live approval feed",
  approvalRule: item.approvalRule || item.approval || "Human approval required.",
}));

const queueItems = workQueue.map((item) => ({
  title: item.title,
  status: item.status || "Intake",
  agent: item.agent || "Unassigned",
  department: item.department || "Unassigned",
  risk: item.risk || "Low",
  due: item.due || "New",
  source: item.source || "Live work queue",
  summary: item.summary || "",
  approval: item.approval || "Internal workflow",
  nextStep: item.nextStep || "",
}));

const healthSignals = agents.map((agent) => {
  const connection = connectionFor(agent, statusRows, backupRows);
  const cron = cronRows.find((row) => row.agent === agent.name);
  const lastAudit = audit.find((item) => item.agent === agent.name);
  const correction = audit.find((item) => item.agent === agent.name && `${item.type || ""} ${item.status || ""}`.toLowerCase().includes("correction"));
  return {
    name: agent.name,
    status: connection.status,
    load: connection.load,
    blocker: connection.blocker,
    cron: cron?.source || "No live cron feed connected",
    score: connection.score,
    trend: connection.trend,
    lastAction: lastAudit?.title || connection.lastAction,
    lastCorrection: correction?.title || "No live correction logged",
    checkIn: connection.checkIn,
  };
});

const logEvents = audit.map((event) => ({
  time: formatTime(event.createdAt || event.time),
  agent: event.agent || "Unassigned",
  human: event.human || event.actor || "Console",
  system: event.system || event.source || "Agent Console",
  type: event.type || "Audit event",
  status: event.status || event.decision || "Logged",
  risk: event.risk || "Low",
  title: event.title || event.type || "Audit event",
  summary: event.summary || event.receipt || "Live audit event recorded.",
  source: event.source || "Local audit log",
  receipt: event.receipt || event.id || "Audit receipt recorded.",
}));

const payload = {
  generatedAt: new Date().toISOString(),
  source: "Live JSON/backup data layer",
  tasks,
  approvalItems,
  queueItems,
  healthSignals,
  logEvents,
};

fs.writeFileSync(
  outPath,
  `// Generated from live data JSON files. Run node scripts/build-live-operational-data.mjs after source updates.\nwindow.BLP_LIVE_OPERATIONAL_DATA = ${JSON.stringify(payload, null, 2)};\n`,
);

console.log(JSON.stringify({
  generatedAt: payload.generatedAt,
  tasks: tasks.length,
  approvalItems: approvalItems.length,
  queueItems: queueItems.length,
  healthSignals: healthSignals.length,
  logEvents: logEvents.length,
  outPath,
}, null, 2));
