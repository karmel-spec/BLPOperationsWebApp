/*
  BLP Sales Dashboard <-> Google Sheets two-way sync. v2 (beta-hardened)

  Install:
  1. Open the live Leads Log spreadsheet.
  2. Extensions -> Apps Script. Paste this entire file into Code.gs (replace everything).
  3. Set SYNC_SECRET below to the same long random value you add in Netlify
     as SALES_LEADS_SYNC_SECRET.
  4. Deploy -> New deployment -> Web app.
       Execute as: Me
       Who has access: Anyone
  5. Copy the Web app URL into Netlify env var SALES_LEADS_APPS_SCRIPT_URL.

  v2 changes:
  - Rows are matched by stable blp_id FIRST; rowNumber is only a fallback.
    (Old version matched rowNumber first, which corrupts the wrong customer's
    row after any sheet delete/sort.)
  - New leads get a server-generated blp_id written into the sheet and
    returned to the app, so identity is stable from creation.
  - LockService wraps all writes so two reps saving at once cannot interleave.
  - Fixed alias collision: a column named "Timeline" no longer mismaps to status.
  - If the sheet has no blp_id column, one is created automatically.
*/

const SYNC_SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
const SHEET_NAME = "Shop/Sales LEADS-30 Days";
const ID_COLUMN_HEADER = "blp_id";

const FIELD_ALIASES = {
  id: ["blp_id", "id", "lead_id"],
  row: ["row"],
  name: ["name", "lead", "customer", "customer name"],
  first: ["first", "first name"],
  last: ["last", "last name"],
  email: ["email", "e-mail"],
  phone: ["phone", "cell", "cell phone", "telephone"],
  instrument: ["instrument", "headline", "piano summary", "lead summary"],
  type: ["type", "instrument type"],
  temp: ["temp", "temperature"],
  rep: ["rep", "current rep", "assigned rep"],
  rep_opened: ["rep_opened", "opened by", "rep opened lead"],
  rep_working: ["rep_working", "working rep", "currently working"],
  rep_closed: ["rep_closed", "closed by", "rep closed lead"],
  source: ["source", "sob", "source of business"],
  band: ["band", "value", "$ value", "deal size"],
  next: ["next", "next action"],
  status_bucket: ["status_bucket", "status"],
  raw_status: ["raw_status", "raw status"],
  notes: ["notes", "lead notes"],
  date_added: ["date_added", "date added", "created", "created date"],
  pricing_extracted: ["pricing_extracted", "pricing", "quote details"],
  last_contact_date: ["last_contact_date", "last contact"],
  days_since_contact: ["days_since_contact", "days since contact"],
  last_action: ["last_action", "last action"],
  inquiry_method: ["inquiry_method", "inquiry method"],
  lead_type: ["lead_type", "type of lead"],
  piano_type: ["piano_type", "type of piano"],
  location: ["location", "city state"],
  social: ["social", "social handle"],
  timeline_json: ["timeline_json", "timeline json", "timeline"],
};

function doGet(e) {
  if (!isAuthorized_(e.parameter.secret)) return json_({ ok: false, error: "Unauthorized" });
  const action = e.parameter.action || "list";
  if (action !== "list") return json_({ ok: false, error: "Unknown action" });
  const sheet = getSheet_();
  const { headers, rows } = readSheet_(sheet);
  return json_({ ok: true, leads: rows.map((row, i) => normalizeRow_(headers, row, i + 2)) });
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  if (!isAuthorized_(payload.secret)) return json_({ ok: false, error: "Unauthorized" });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: "Sheet is busy, try again." });
  }

  try {
    const sheet = getSheet_();
    ensureIdColumn_(sheet);
    const { headers, rows } = readSheet_(sheet);
    const action = payload.action;

    if (action === "update") {
      const target = findRow_(headers, rows, payload.lead);
      if (!target) return json_({ ok: false, error: "Lead row not found" });
      writeLead_(sheet, headers, target.rowNumber, payload.lead);
      const blpId = ensureRowId_(sheet, headers, target.rowNumber);
      return json_({ ok: true, action, rowNumber: target.rowNumber, blp_id: blpId, id: blpId });
    }

    if (action === "create") {
      const lead = payload.lead || {};
      const blpId = String(lead.blp_id || lead.id || "").match(/^BLP-/) ? String(lead.blp_id || lead.id) : newId_();
      lead.blp_id = blpId;
      lead.id = blpId;
      const rowNumber = appendLead_(sheet, headers, lead);
      return json_({ ok: true, action, rowNumber, blp_id: blpId, id: blpId });
    }

    if (action === "delete") {
      const target = findRow_(headers, rows, payload.lead);
      if (!target) return json_({ ok: false, error: "Lead row not found" });
      sheet.deleteRow(target.rowNumber);
      return json_({ ok: true, action, rowNumber: target.rowNumber });
    }

    return json_({ ok: false, error: "Unknown action" });
  } finally {
    lock.releaseLock();
  }
}

function getSheet_() {
  return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActive().getSheets()[0];
}

function ensureIdColumn_(sheet) {
  const headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0]
    .map(h => normalizeHeader_(h));
  if (headers.indexOf(normalizeHeader_(ID_COLUMN_HEADER)) >= 0) return;
  sheet.getRange(1, sheet.getLastColumn() + 1).setValue(ID_COLUMN_HEADER);
}

function ensureRowId_(sheet, headers, rowNumber) {
  const liveHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h || "").trim());
  const idCol = findCol_(liveHeaders, "id");
  if (idCol < 0) return "";
  const cell = sheet.getRange(rowNumber, idCol + 1);
  let value = String(cell.getValue() || "").trim();
  if (!value) {
    value = newId_();
    cell.setValue(value);
  }
  return value;
}

function newId_() {
  return "BLP-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function readSheet_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(h => String(h || "").trim());
  return { headers, rows: values };
}

function normalizeRow_(headers, row, rowNumber) {
  const lead = { rowNumber };
  Object.keys(FIELD_ALIASES).forEach(field => {
    const col = findCol_(headers, field);
    if (col >= 0) lead[field] = row[col];
  });
  lead.id = lead.id || lead.rowNumber;
  lead.blp_id = lead.id;
  lead.rep_working = lead.rep_working || lead.rep || "admin";
  lead.rep = lead.rep || lead.rep_working;
  lead.rep_opened = lead.rep_opened || lead.rep || "admin";
  lead.rep_closed = lead.rep_closed || "";
  lead.temp = Number(lead.temp || 5);
  lead.days = Number(lead.days || lead.days_since_contact || 0);
  if (lead.timeline_json) {
    try { lead.timeline = JSON.parse(lead.timeline_json); } catch (err) {}
  }
  return lead;
}

function writeLead_(sheet, headers, rowNumber, lead) {
  Object.keys(lead || {}).forEach(field => {
    if (field === "rowNumber" || field === "timeline") return;
    const col = findCol_(headers, field);
    if (col >= 0) sheet.getRange(rowNumber, col + 1).setValue(valueForSheet_(lead[field]));
  });
}

function appendLead_(sheet, headers, lead) {
  const liveHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h || "").trim());
  const row = liveHeaders.map((header) => {
    const field = fieldForHeader_(header);
    return field ? valueForSheet_(lead[field]) : "";
  });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function findRow_(headers, rows, lead) {
  // v2: stable ID first. Row numbers shift when rows are deleted or sorted,
  // so they are only a last resort.
  const idCol = findCol_(headers, "id");
  if (idCol >= 0 && lead && (lead.blp_id != null || lead.id != null)) {
    const id = String(lead.blp_id != null ? lead.blp_id : lead.id);
    if (id) {
      const index = rows.findIndex(r => String(r[idCol]).trim() === id.trim());
      if (index >= 0) return { rowNumber: index + 2 };
    }
  }
  const rowNumber = Number(lead && lead.rowNumber);
  if (rowNumber && rowNumber > 1 && rowNumber <= rows.length + 1) return { rowNumber };
  return null;
}

function findCol_(headers, field) {
  const aliases = FIELD_ALIASES[field] || [field];
  const normalizedHeaders = headers.map(normalizeHeader_);
  return normalizedHeaders.findIndex(h => aliases.map(normalizeHeader_).includes(h));
}

function fieldForHeader_(header) {
  const normalized = normalizeHeader_(header);
  return Object.keys(FIELD_ALIASES).find(field => FIELD_ALIASES[field].map(normalizeHeader_).includes(normalized));
}

function normalizeHeader_(value) {
  return String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function valueForSheet_(value) {
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  return value == null ? "" : value;
}

function isAuthorized_(secret) {
  return String(secret || "") === SYNC_SECRET && SYNC_SECRET !== "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
