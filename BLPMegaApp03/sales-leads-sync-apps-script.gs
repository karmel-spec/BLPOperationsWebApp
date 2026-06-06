/*
  BLP Sales Dashboard <-> Google Sheets two-way sync.

  Install:
  1. Open the live Leads Log spreadsheet.
  2. Extensions -> Apps Script.
  3. Paste this file into Code.gs.
  4. Set SYNC_SECRET to the same value you add in Netlify as SALES_LEADS_SYNC_SECRET.
  5. Deploy -> New deployment -> Web app.
     Execute as: Me
     Who has access: Anyone with the link
  6. Copy the Web app URL into Netlify env var SALES_LEADS_APPS_SCRIPT_URL.

  Sheet expectation:
  - Header row contains field names. The script normalizes common labels.
  - If a blp_id column does not exist, add one to the sheet and fill stable IDs.
*/

const SYNC_SECRET = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET";
const SHEET_NAME = "Shop/Sales LEADS-30 Days";

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
  rep: ["rep", "current rep", "assigned rep", "currently working"],
  rep_opened: ["rep_opened", "opened by", "rep opened lead"],
  rep_working: ["rep_working", "working rep", "currently working"],
  rep_closed: ["rep_closed", "closed by", "rep closed lead"],
  source: ["source", "sob", "source of business"],
  band: ["band", "value", "$ value", "deal size"],
  next: ["next", "next action"],
  status_bucket: ["status_bucket", "status", "timeline"],
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
  timeline_json: ["timeline_json", "timeline"],
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
  const sheet = getSheet_();
  const { headers, rows } = readSheet_(sheet);
  const action = payload.action;

  if (action === "update") {
    const target = findRow_(headers, rows, payload.lead);
    if (!target) return json_({ ok: false, error: "Lead row not found" });
    writeLead_(sheet, headers, target.rowNumber, payload.lead);
    return json_({ ok: true, action, rowNumber: target.rowNumber });
  }

  if (action === "create") {
    const rowNumber = appendLead_(sheet, headers, payload.lead);
    return json_({ ok: true, action, rowNumber });
  }

  if (action === "delete") {
    const target = findRow_(headers, rows, payload.lead);
    if (!target) return json_({ ok: false, error: "Lead row not found" });
    sheet.deleteRow(target.rowNumber);
    return json_({ ok: true, action, rowNumber: target.rowNumber });
  }

  return json_({ ok: false, error: "Unknown action" });
}

function getSheet_() {
  return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActive().getSheets()[0];
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
    const col = findCol_(headers, field);
    if (col >= 0) sheet.getRange(rowNumber, col + 1).setValue(valueForSheet_(lead[field]));
  });
}

function appendLead_(sheet, headers, lead) {
  const row = headers.map((_, colIndex) => {
    const field = fieldForHeader_(headers[colIndex]);
    return field ? valueForSheet_(lead[field]) : "";
  });
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function findRow_(headers, rows, lead) {
  const idCol = findCol_(headers, "id");
  const rowNumber = Number(lead && lead.rowNumber);
  if (rowNumber && rowNumber > 1) return { rowNumber };
  if (idCol >= 0 && lead && lead.id != null) {
    const id = String(lead.id);
    const index = rows.findIndex(r => String(r[idCol]) === id);
    if (index >= 0) return { rowNumber: index + 2 };
  }
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
  return String(secret || "") === SYNC_SECRET;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
