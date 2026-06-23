#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const htmlPath = path.join(root, "modules/sales-console/index.html");
const html = fs.readFileSync(htmlPath, "utf8");

const rules = [
  {
    icon: "📞",
    name: "phone",
    actionPatterns: [/onclick="dialNow\(\)"/, /onclick="callLead\('\$\{l\.id\}'\)"/],
  },
  {
    icon: "💬",
    name: "text",
    actionPatterns: [/onclick="sendSmsNow\(\)"/, /onclick="sendSms\('\$\{l\.id\}'\)"/],
  },
  {
    icon: "✉️",
    name: "email",
    actionPatterns: [/onclick="openDraft\('\$\{l\.id\}'\)"/],
  },
];

const failures = [];

for (const rule of rules) {
  const matches = findIconMatches(rule.icon);
  if (!matches.length) failures.push(`${rule.name} icon ${rule.icon} is missing`);

  for (const match of matches) {
    if (isActionIconMap(match.index)) continue;
    const button = enclosingButton(match.index);
    if (!button) {
      failures.push(`${rule.name} icon ${rule.icon} at line ${match.line} is not inside a button`);
      continue;
    }
    if (!rule.actionPatterns.some((pattern) => pattern.test(button))) {
      failures.push(`${rule.name} icon ${rule.icon} at line ${match.line} is not wired to the expected action`);
    }
  }
}

assertContains("startRecommendedAction", "recommended channel button handler exists");
assertContains("const ACTION_ICON = { call:'📞', text:'💬', email:'✉️' };", "action icon map feeds recommended action buttons");
assertContains("onclick=\"event.stopPropagation();startRecommendedAction('${l.id}', '${nextType}')\"", "recommended action icon button is clickable");

if (failures.length) {
  console.error("Sales communication icon audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sales communication icon audit passed.");

function findIconMatches(icon) {
  const matches = [];
  let index = 0;
  while ((index = html.indexOf(icon, index)) !== -1) {
    matches.push({ index, line: html.slice(0, index).split("\n").length });
    index += icon.length;
  }
  return matches;
}

function isActionIconMap(index) {
  const line = lineAt(index);
  return line.includes("const ACTION_ICON =");
}

function enclosingButton(index) {
  const before = html.lastIndexOf("<button", index);
  const closeBefore = html.lastIndexOf("</button>", index);
  if (before === -1 || closeBefore > before) return "";
  const after = html.indexOf("</button>", index);
  if (after === -1) return "";
  return html.slice(before, after + "</button>".length);
}

function lineAt(index) {
  const start = html.lastIndexOf("\n", index - 1) + 1;
  const end = html.indexOf("\n", index);
  return html.slice(start, end === -1 ? html.length : end);
}

function assertContains(snippet, label) {
  if (!html.includes(snippet)) failures.push(label);
}
