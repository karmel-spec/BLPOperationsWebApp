import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const root = path.resolve(import.meta.dirname, "..");
const dataDir = path.join(root, "data");
const workQueuePath = path.join(dataDir, "work-queue.json");
const auditLogPath = path.join(dataDir, "audit-log.jsonl");
const port = Number(process.env.BLP_CONSOLE_API_PORT || 8787);
const execFileAsync = promisify(execFile);
const hermesBinary = process.env.BLP_HERMES_BIN || "/Users/blpadmin/.hermes/hermes-agent/venv/bin/hermes";
const hermesSendEnabled = process.env.BLP_HERMES_SEND_ENABLED === "true";
const hermesSendTarget = process.env.BLP_HERMES_SEND_TARGET || "telegram";
const openclawBinary = process.env.BLP_OPENCLAW_BIN || "openclaw";
const openclawSendEnabled = process.env.BLP_OPENCLAW_SEND_ENABLED === "true";
const notionToken = process.env.BLP_NOTION_TOKEN || process.env.NOTION_TOKEN || "";
const notionWorkDatabaseId = process.env.BLP_NOTION_WORK_DATABASE_ID || "";
const notionVersion = process.env.BLP_NOTION_VERSION || "2026-03-11";

function ensureFiles() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(workQueuePath)) fs.writeFileSync(workQueuePath, "[]\n");
  if (!fs.existsSync(auditLogPath)) fs.writeFileSync(auditLogPath, "");
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8") || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body ? JSON.parse(body) : {}));
    request.on("error", reject);
  });
}

function send(response, status, payload) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload, null, 2));
}

function appendAudit(event) {
  const record = {
    id: event.id || crypto.randomUUID(),
    createdAt: event.createdAt || new Date().toISOString(),
    ...event,
  };
  fs.appendFileSync(auditLogPath, `${JSON.stringify(record)}\n`);
  return record;
}

function addWorkQueueItem(item) {
  const queue = readJson(workQueuePath, []);
  const record = {
    id: item.id || crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
    status: item.status || "Intake",
    ...item,
  };
  queue.unshift(record);
  writeJson(workQueuePath, queue);
  return record;
}

function formatHermesMessage(body, item) {
  const action = body.action || "Message";
  const title = item?.title || body.title || `${action} for ${body.agent || "Lindsay"}`;
  const summary = body.summary || "No details supplied.";
  const nextStep = body.nextStep ? `\nNext step: ${body.nextStep}` : "";
  return [
    `New ${action} for Lindsay from the BLP Agent Operations Console`,
    `Title: ${title}`,
    `Risk: ${body.risk || item?.risk || "Low"}`,
    `Approval: ${body.approval || item?.approval || "Internal only"}`,
    "",
    summary,
    nextStep,
  ].join("\n");
}

function formatOpenClawMessage(body, item) {
  const action = body.action || "Message";
  const title = item?.title || body.title || `${action} for ${body.agent || "Chris"}`;
  const summary = body.summary || "No details supplied.";
  const nextStep = body.nextStep ? `\nNext step: ${body.nextStep}` : "";
  return [
    `New ${action} from the BLP Agent Operations Console`,
    `Title: ${title}`,
    `Risk: ${body.risk || item?.risk || "Low"}`,
    `Approval: ${body.approval || item?.approval || "Internal only"}`,
    "",
    summary,
    nextStep,
  ].join("\n");
}

function notionProperty(properties, names) {
  for (const name of names) {
    if (properties?.[name]) return properties[name];
  }
  return null;
}

function notionTextFromProperty(property) {
  if (!property) return "";
  if (property.type === "title") return property.title?.map((part) => part.plain_text).join("").trim() || "";
  if (property.type === "rich_text") return property.rich_text?.map((part) => part.plain_text).join("").trim() || "";
  if (property.type === "select") return property.select?.name || "";
  if (property.type === "status") return property.status?.name || "";
  if (property.type === "multi_select") return property.multi_select?.map((item) => item.name).join(", ") || "";
  if (property.type === "people") return property.people?.map((person) => person.name || person.person?.email).filter(Boolean).join(", ") || "";
  if (property.type === "date") return property.date?.start || "";
  if (property.type === "url") return property.url || "";
  if (property.type === "email") return property.email || "";
  if (property.type === "phone_number") return property.phone_number || "";
  if (property.type === "checkbox") return property.checkbox ? "Yes" : "No";
  if (property.type === "number") return property.number == null ? "" : String(property.number);
  return "";
}

function normalizeNotionWorkPage(page) {
  const properties = page.properties || {};
  const title = notionTextFromProperty(notionProperty(properties, ["Task", "Name", "Title", "Project", "Request"])) || "Untitled Notion work item";
  const agent = notionTextFromProperty(notionProperty(properties, ["Agent", "Owner Agent", "Assigned Agent", "Assignee", "Owner"])) || "Unassigned";
  const status = notionTextFromProperty(notionProperty(properties, ["Status", "Stage", "State"])) || "Notion";
  const priority = notionTextFromProperty(notionProperty(properties, ["Priority", "Risk"])) || "Normal";
  const due = notionTextFromProperty(notionProperty(properties, ["Due", "Due Date", "Deadline"])) || "No due date";
  const department = notionTextFromProperty(notionProperty(properties, ["Department", "Team", "Area"])) || "Operations";
  const summary = notionTextFromProperty(notionProperty(properties, ["Summary", "Notes", "Description", "Brief"])) || "Synced from Notion.";
  const nextStep = notionTextFromProperty(notionProperty(properties, ["Next Step", "Next", "Action", "Next Action"])) || "Review in Notion.";

  return {
    id: page.id,
    source: "Notion",
    notionUrl: page.url,
    createdAt: page.created_time,
    updatedAt: page.last_edited_time,
    title,
    agent,
    department,
    status,
    priority,
    risk: priority,
    due,
    summary,
    nextStep,
  };
}

async function queryNotionWork() {
  if (!notionToken || !notionWorkDatabaseId) {
    return {
      ok: false,
      configured: false,
      reason: "Set BLP_NOTION_TOKEN and BLP_NOTION_WORK_DATABASE_ID to enable Notion work sync.",
      items: [],
    };
  }

  const headers = {
    Authorization: `Bearer ${notionToken}`,
    "Content-Type": "application/json",
    "Notion-Version": notionVersion,
  };
  const candidateIds = [notionWorkDatabaseId];

  const databaseResponse = await fetch(`https://api.notion.com/v1/databases/${notionWorkDatabaseId}`, {
    method: "GET",
    headers,
  });
  if (databaseResponse.ok) {
    const databasePayload = await databaseResponse.json();
    const dataSourceIds = (databasePayload.data_sources || []).map((source) => source.id).filter(Boolean);
    candidateIds.push(...dataSourceIds);
  } else {
    const childrenResponse = await fetch(`https://api.notion.com/v1/blocks/${notionWorkDatabaseId}/children?page_size=100`, {
      method: "GET",
      headers,
    });
    if (childrenResponse.ok) {
      const childrenPayload = await childrenResponse.json();
      const childDatabaseIds = (childrenPayload.results || [])
        .filter((block) => block.type === "child_database")
        .map((block) => block.id)
        .filter(Boolean);
      candidateIds.push(...childDatabaseIds);
      for (const childDatabaseId of childDatabaseIds) {
        const childDatabaseResponse = await fetch(`https://api.notion.com/v1/databases/${childDatabaseId}`, {
          method: "GET",
          headers,
        });
        if (childDatabaseResponse.ok) {
          const childDatabasePayload = await childDatabaseResponse.json();
          const childDataSourceIds = (childDatabasePayload.data_sources || []).map((source) => source.id).filter(Boolean);
          candidateIds.push(...childDataSourceIds);
        }
      }
    }
  }

  let lastFailure = null;
  for (const dataSourceId of [...new Set(candidateIds)]) {
    const response = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        page_size: 50,
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }],
      }),
    });

    const payload = await response.json();
    if (response.ok) {
      return {
        ok: true,
        configured: true,
        syncedAt: new Date().toISOString(),
        databaseId: notionWorkDatabaseId,
        dataSourceId,
        items: (payload.results || []).map(normalizeNotionWorkPage),
      };
    }

    lastFailure = {
      status: response.status,
      reason: payload.message || "Notion API request failed.",
    };
  }

  return {
    ok: false,
    configured: true,
    status: lastFailure?.status,
    reason: lastFailure?.reason || "No queryable Notion data source was found for this ID.",
    items: [],
  };
}

async function dispatchToHermes(body, item) {
  if (body.agent !== "Lindsay") {
    return { skipped: true, reason: "Only Lindsay is enabled for Hermes dispatch in this MVP bridge." };
  }
  if (!hermesSendEnabled) {
    return { skipped: true, reason: "Set BLP_HERMES_SEND_ENABLED=true to enable hermes send dispatch." };
  }
  if (!fs.existsSync(hermesBinary)) {
    return { skipped: true, reason: `Hermes binary not found at ${hermesBinary}` };
  }

  const message = formatHermesMessage(body, item);
  const { stdout, stderr } = await execFileAsync(hermesBinary, ["send", "--to", hermesSendTarget, message], {
    timeout: 30_000,
    maxBuffer: 1024 * 1024,
  });
  return {
    skipped: false,
    mode: "hermes send",
    target: hermesSendTarget,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

async function dispatchToOpenClaw(body, item) {
  if (body.agent !== "Chris") {
    return { skipped: true, reason: "Only Chris is enabled for OpenClaw dispatch in this first test bridge." };
  }
  if (!openclawSendEnabled) {
    return { skipped: true, reason: "Set BLP_OPENCLAW_SEND_ENABLED=true to enable OpenClaw CLI dispatch." };
  }

  const taskId = item?.id || crypto.randomUUID();
  const sessionKey = `agent:chris:console-${taskId}`;
  const message = formatOpenClawMessage(body, item);
  const args = [
    "agent",
    "--agent",
    "chris",
    "--session-key",
    sessionKey,
    "--message",
    message,
    "--json",
    "--timeout",
    "180",
  ];

  const { stdout, stderr } = await execFileAsync(openclawBinary, args, {
    timeout: 210_000,
    maxBuffer: 1024 * 1024,
  });
  return {
    skipped: false,
    mode: "openclaw agent",
    binary: openclawBinary,
    sessionKey,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
}

ensureFiles();

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      send(response, 204, {});
      return;
    }

    const url = new URL(request.url, `http://localhost:${port}`);

    if (request.method === "GET" && url.pathname === "/api/health") {
      send(response, 200, {
        ok: true,
        service: "BLP Agent Console local API",
        workQueuePath,
        auditLogPath,
        hermes: {
          binary: hermesBinary,
          sendEnabled: hermesSendEnabled,
          sendTarget: hermesSendTarget,
        },
        openclaw: {
          binary: openclawBinary,
          sendEnabled: openclawSendEnabled,
          firstAgentEnabled: "Chris",
        },
        notion: {
          configured: Boolean(notionToken && notionWorkDatabaseId),
          workDatabaseId: notionWorkDatabaseId ? `${notionWorkDatabaseId.slice(0, 6)}...` : null,
          version: notionVersion,
        },
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/notion/work") {
      send(response, 200, await queryNotionWork());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/work-queue") {
      send(response, 200, readJson(workQueuePath, []));
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/work-queue") {
      const body = await readBody(request);
      const item = addWorkQueueItem(body);
      const audit = appendAudit({
        type: "work_queue_created",
        agent: item.agent,
        title: item.title,
        source: "local-api",
        payload: item,
      });
      send(response, 201, { item, audit });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/audit-log") {
      const body = await readBody(request);
      const audit = appendAudit(body);
      send(response, 201, audit);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/agent-action") {
      const body = await readBody(request);
      const audit = appendAudit({
        type: "agent_action",
        source: "agent-console",
        ...body,
      });
      let item = null;
      if (body.action === "Assign Task" || body.action === "Assign Project") {
        item = addWorkQueueItem({
          title: body.title,
          agent: body.agent,
          department: body.department,
          type: "Assignment",
          approval: body.approval || "Internal only",
          risk: body.risk || "Low",
          due: body.due || "New",
          source: "Agent Console",
          summary: body.summary,
          nextStep: body.nextStep,
        });
      }
      const dispatch = body.agent === "Chris" ? await dispatchToOpenClaw(body, item) : await dispatchToHermes(body, item);
      const dispatchAudit = appendAudit({
        type: body.agent === "Chris" ? "openclaw_dispatch_attempt" : "hermes_dispatch_attempt",
        agent: body.agent,
        title: body.title,
        source: "local-api",
        payload: dispatch,
      });
      send(response, 201, { audit, item, dispatch, dispatchAudit });
      return;
    }

    send(response, 404, { error: "Not found" });
  } catch (error) {
    send(response, 500, { error: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`BLP Agent Console local API running at http://127.0.0.1:${port}`);
  console.log(`Work queue: ${workQueuePath}`);
  console.log(`Audit log: ${auditLogPath}`);
  console.log(`Hermes send: ${hermesSendEnabled ? "enabled" : "disabled"} (${hermesBinary} -> ${hermesSendTarget})`);
});
