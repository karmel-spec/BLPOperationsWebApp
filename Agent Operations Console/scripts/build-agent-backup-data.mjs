import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const jsonPath = path.join(root, "data", "agent-backup-sources.json");
const outPath = path.join(root, "data", "agent-backup-sources-data.js");
const sources = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

if (!Array.isArray(sources)) {
  throw new Error("data/agent-backup-sources.json must contain an array.");
}

function fileMeta(filePath) {
  if (!filePath) return null;
  try {
    const stat = fs.statSync(filePath);
    return {
      exists: true,
      modifiedAt: stat.mtime.toISOString(),
      size: stat.size,
    };
  } catch {
    return {
      exists: false,
      modifiedAt: null,
      size: 0,
    };
  }
}

function resolveRelative(base, relativePath) {
  if (!base || !relativePath) return null;
  return path.resolve(base, relativePath);
}

const defaultDocuments = [
  { key: "agent", label: "Agent", candidates: ["agent.md", "agents.md"] },
  { key: "identity", label: "Identity", candidates: ["identity.md", "indentity.md"] },
  { key: "soul", label: "Soul", candidates: ["soul.md"] },
  { key: "skill", label: "Skill", candidates: ["skill.md", "skills.md"] },
  { key: "safety", label: "Safety Rules", candidates: ["safetyrules.md", "safety-rules.md", "safety_rules.md"] },
  { key: "status", label: "Status", candidates: ["status.md", "STATUS.md"] },
];

const agentSpecificDocuments = {
  Chris: [
    {
      key: "schedulingRules",
      label: "Scheduling Rules",
      candidates: ["scheduling-rules.md", "schedulingrules.md", "scheduling_rules.md", "scheduuling-rules.md", "scheduulingrules.md"],
    },
  ],
};

function resolveDocument(source, spec) {
  const base = source.localSyncPath;
  const candidates = spec.candidates || [];
  const resolved = candidates.map((candidate) => {
    const fullPath = resolveRelative(base, candidate);
    return {
      fileName: candidate,
      fullPath,
      fileUrl: fullPath ? `file://${encodeURI(fullPath)}` : null,
      meta: fileMeta(fullPath),
    };
  });
  const found = resolved.find((item) => item.meta?.exists) || resolved[0] || null;
  return {
    key: spec.key,
    label: spec.label,
    expectedFile: candidates[0] || null,
    candidates,
    path: found?.fullPath || null,
    url: found?.fileUrl || null,
    exists: Boolean(found?.meta?.exists),
    modifiedAt: found?.meta?.modifiedAt || null,
  };
}

const enriched = sources.map((source) => {
  const statusFile = resolveRelative(source.localSyncPath, source.statusPath);
  const cronFile = resolveRelative(source.localSyncPath, source.cronPath);
  const documentSpecs = [...defaultDocuments, ...(agentSpecificDocuments[source.name] || [])];
  return {
    ...source,
    statusFileMeta: fileMeta(statusFile),
    cronFileMeta: fileMeta(cronFile),
    backupDocuments: documentSpecs.map((spec) => resolveDocument(source, spec)),
  };
});

fs.writeFileSync(
  outPath,
  `// Generated from data/agent-backup-sources.json. Edit backup source JSON, then run node scripts/build-agent-backup-data.mjs.\nwindow.BLP_AGENT_BACKUP_SOURCES = ${JSON.stringify(enriched, null, 2)};\n`,
);

console.log(JSON.stringify({
  agents: enriched.length,
  connected: enriched.filter((source) => source.connectionStatus !== "needs-backup-folder").length,
  statusFilesFound: enriched.filter((source) => source.statusFileMeta?.exists).length,
  outPath,
}, null, 2));
