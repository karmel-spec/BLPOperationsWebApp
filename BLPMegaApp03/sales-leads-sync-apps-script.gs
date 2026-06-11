/*
  BLP Sales Dashboard <-> Google Sheets two-way sync. v4 — secret moved to Script Properties (paste-safe) + batched writes + new leads at top
  Column map matched to the real "Shop/Sales LEADS-30 Days" headers (June 2026).

  Install / update:
  1. Open the Leads Log spreadsheet -> Extensions -> Apps Script.
  2. Replace ALL of Code.gs with this file.
  3. Set SYNC_SECRET below to your Secret 1 (same value as Netlify's
     SALES_LEADS_SYNC_SECRET).
  4. Deploy -> Manage deployments -> pencil icon -> Version: New version -> Deploy.
     (The /exec URL stays the same; Netlify does not change.)

  v3 changes:
  - Header matching now ignores punctuation, so "Source of Business?",
    "Sales Rep OPEN / CLOSE", "1-10", "(New Lead Alert)..." all match.
  - Exact aliases added for every real column in the sheet.
  - Customer name composed from FIRST + LAST columns.
  - Status bucket (Won/Lost/Snoozed/Brand New/Active) derived from the
    "Outcome/Status (+ reason)" text; app status changes write back to it.
  - Days-since-contact computed from "Date of Last Contact".
  - "Activity Timeline" (your hand-written history) is READ-ONLY: shown in the
    app, never overwritten. The app's structured timeline persists in a new
    auto-created "timeline_json" column at the far right.
  - blp_id and timeline_json columns are auto-created if missing.
*/

/* v4: The secret now lives in Script Properties, NOT in this code.
   Set it ONCE: Apps Script editor -> Project Settings (gear icon) ->
   Script properties -> Add property -> name: SYNC_SECRET, value: Secret 1.
   After that you can paste future versions of this file without ever
   touching a secret line again. */
const SYNC_SECRET = ""; // leave empty — Script Properties is the source of truth

function getSecret_() {
  try {
    const p = PropertiesService.getScriptProperties().getProperty("SYNC_SECRET");
    if (p) return String(p).trim();
  } catch (e) {}
  return SYNC_SECRET;
}
const SHEET_NAME = "Shop/Sales LEADS-30 Days";
const ID_COLUMN_HEADER = "blp_id";
const TIMELINE_COLUMN_HEADER = "timeline_json";

const FIELD_ALIASES = {
  id: ["blp_id", "lead_id"],
  name: ["name", "customer name"],
  first: ["first", "first name", "customer first name"],
  last: ["last", "last name", "customer last name"],
  email: ["email", "e mail", "customer email"],
  phone: ["phone", "cell", "cell phone", "telephone", "customer phone number"],
  instrument: ["instrument", "headline", "piano summary", "lead summary"],
  temp: ["temp", "temperature", "1 10"],
  rep: ["rep", "current rep", "assigned rep", "sales rep open close"],
  rep_opened: ["rep_opened", "opened by", "lead capture entry admin name"],
  rep_working: ["rep_working", "working rep"],
  rep_closed: ["rep_closed", "closed by"],
  source: ["source", "sob", "source of business"],
  band: ["band", "value", "deal size"],
  next: ["next", "next action"],
  raw_status: ["raw_status", "raw status", "outcome status reason"],
  status_bucket: ["status_bucket"],
  notes: ["notes", "lead notes", "brigham 1st follow up notes former system"],
  date_added: ["date_added", "date added", "created", "created date"],
  last_contact_date: ["last_contact_date", "last contact", "date of last contact"],
  days_since_contact: ["days_since_contact", "days since contact"],
  inquiry_method: ["inquiry_method", "inquiry method"],
  lead_type: ["lead_type", "type of lead"],
  piano_type: ["piano_type", "type of piano"],
  location: ["location", "city state"],
  social: ["social", "social handle", "customer social media handle"],
  timeline_text: ["activity timeline"],
  timeline_json: ["timeline json"],
};

// Fields the app sends that must NEVER be written to the sheet.
const WRITE_SKIP = ["rowNumber", "timeline", "timeline_text", "days", "raw_status", "status_bucket"];

function doGet(e) {
  if (!isAuthorized_(e.parameter.secret)) return json_({ ok: false, error: "Unauthorized" });
  const action = e.parameter.action || "list";
  if (action === "mapping") {
    const sheet0 = getSheet_();
    const hdrs = liveHeaders_(sheet0);
    const report = hdrs.map(h => ({ header: h, mapsTo: fieldForHeaderFuzzy_(hdrs, h) || "(ignored)" }));
    return json_({ ok: true, sheetName: sheet0.getName(), mapping: report });
  }
  if (action !== "list") return json_({ ok: false, error: "Unknown action" });
  const sheet = getSheet_();
  const { headers, rows } = readSheet_(sheet);
  const leads = rows
    .map((row, i) => normalizeRow_(headers, row, i + 2))
    .filter(isRealLead_);
  return json_({ ok: true, leads });
}

// Divider rows like "HOT LEADS!" have no name and no way to contact anyone.
function isRealLead_(lead) {
  const name = cleanStr_(lead.name);
  const phone = cleanStr_(lead.phone);
  const email = cleanStr_(lead.email);
  return Boolean(name) || Boolean(phone) || Boolean(email);
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
    ensureColumn_(sheet, ID_COLUMN_HEADER);
    ensureColumn_(sheet, TIMELINE_COLUMN_HEADER);
    const { headers, rows } = readSheet_(sheet);
    const action = payload.action;

    if (action === "update") {
      const target = findRow_(headers, rows, payload.lead);
      if (!target) return json_({ ok: false, error: "Lead row not found" });
      const blpId = writeLead_(sheet, headers, target.rowNumber, payload.lead);
      return json_({ ok: true, action, rowNumber: target.rowNumber, blp_id: blpId, id: blpId });
    }

    if (action === "create") {
      const lead = payload.lead || {};
      const blpId = /^BLP-/.test(String(lead.blp_id || lead.id || "")) ? String(lead.blp_id || lead.id) : newId_();
      lead.blp_id = blpId;
      lead.id = blpId;
      const rowNumber = appendLead_(sheet, lead);
      writeStatusCell_(sheet, rowNumber, lead);
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

/* ---------------- sheet helpers ---------------- */

function getSheet_() {
  return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME) || SpreadsheetApp.getActive().getSheets()[0];
}

function liveHeaders_(sheet) {
  return sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(h => String(h || "").trim());
}

function ensureColumn_(sheet, headerName) {
  const normalized = liveHeaders_(sheet).map(normalizeHeader_);
  if (normalized.indexOf(normalizeHeader_(headerName)) >= 0) return;
  sheet.getRange(1, sheet.getLastColumn() + 1).setValue(headerName);
}

function ensureRowId_(sheet, rowNumber) {
  const idCol = findCol_(liveHeaders_(sheet), "id");
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

/* ---------------- read path ---------------- */

function normalizeRow_(headers, row, rowNumber) {
  const lead = { rowNumber };
  Object.keys(FIELD_ALIASES).forEach(field => {
    const col = findCol_(headers, field);
    if (col >= 0) lead[field] = row[col];
  });

  lead.id = String(lead.id || "").trim() || lead.rowNumber;
  lead.blp_id = lead.id;

  // Compose display name from FIRST + LAST columns.
  const composed = [lead.first, lead.last].map(v => String(v || "").trim()).filter(Boolean).join(" ");
  lead.name = String(lead.name || "").trim() || composed;

  lead.rep = cleanStr_(lead.rep) || "admin";
  lead.rep_working = cleanStr_(lead.rep_working) || lead.rep;
  lead.rep_opened = cleanStr_(lead.rep_opened) || lead.rep;
  lead.rep_closed = cleanStr_(lead.rep_closed);

  lead.temp = clampTemp_(lead.temp);

  // Status bucket derived from the Outcome/Status text.
  lead.raw_status = cleanStr_(lead.raw_status);
  lead.status_bucket = deriveBucket_(lead.raw_status);

  // Days since contact from "Date of Last Contact".
  lead.days_since_contact = daysSince_(lead.last_contact_date, lead.days_since_contact);
  lead.days = lead.days_since_contact;
  lead.last_contact_date = dateStr_(lead.last_contact_date);
  lead.date_added = dateStr_(lead.date_added);

  // Structured timeline from timeline_json column; otherwise seed one entry
  // from the hand-written Activity Timeline so history shows in the app.
  if (lead.timeline_json) {
    try { lead.timeline = JSON.parse(lead.timeline_json); } catch (err) {}
  }
  const handwritten = cleanStr_(lead.timeline_text);
  if ((!lead.timeline || !lead.timeline.length) && handwritten) {
    lead.timeline = [{ date: lead.last_contact_date || "", when: "from sheet", type: "sheet", text: handwritten.slice(0, 2000) }];
  }
  return lead;
}

function deriveBucket_(text) {
  const s = String(text || "").toLowerCase();
  if (/won|sold|purchased|closed deal/.test(s)) return "Won";
  if (/lost|dead|declined|bought elsewhere|not interested|no sale/.test(s)) return "Lost";
  if (/snooz|on hold|paused|wait/.test(s)) return "Snoozed";
  if (/brand new|new lead|^new\b/.test(s)) return "Brand New";
  return "Active";
}

function clampTemp_(value) {
  const n = Number(String(value == null ? "" : value).replace(/[^0-9.]/g, ""));
  if (!isFinite(n) || n <= 0) return 5;
  return Math.max(1, Math.min(10, Math.round(n)));
}

function daysSince_(dateValue, fallback) {
  const d = toDate_(dateValue);
  if (d) return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  const n = Number(fallback);
  return isFinite(n) && n >= 0 ? n : 0;
}

function toDate_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const d = new Date(value);
    if (!isNaN(d)) return d;
  }
  const rowNumber = Number(lead && lead.rowNumber);
  if (rowNumber && rowNumber > 1 && rowNumber <= rows.length + 1) return { rowNumber };
  return null;
}

function dateStr_(value) {
  const d = toDate_(value);
  if (!d) return cleanStr_(value);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function cleanStr_(value) {
  return value == null ? "" : String(value).trim();
}

/* ---------------- write path ---------------- */

function writeLead_(sheet, headers, rowNumber, lead) {
  // ONE read + ONE write for the whole row (was ~20 setValue calls).
  // Keeps lock time short so rapid edits from the app don't collide.
  const live = liveHeaders_(sheet);
  const cols = Math.max(1, live.length);
  const range = sheet.getRange(rowNumber, 1, 1, cols);
  const current = range.getValues()[0];

  Object.keys(lead || {}).forEach(field => {
    if (WRITE_SKIP.indexOf(field) >= 0) return;
    const col = findCol_(live, field);
    if (col >= 0) current[col] = valueForSheet_(lead[field]);
  });

  const sCol = findCol_(live, "raw_status");
  if (sCol >= 0) {
    const v = statusCellValue_(lead, current[sCol]);
    if (v) current[sCol] = v;
  }

  const idCol = findCol_(live, "id");
  if (idCol >= 0 && !cleanStr_(current[idCol])) current[idCol] = newId_();

  range.setValues([current]);
  return idCol >= 0 ? cleanStr_(current[idCol]) : "";
}

function statusCellValue_(lead, existing) {
  const bucket = cleanStr_(lead && lead.status_bucket);
  const raw = cleanStr_(lead && lead.raw_status) || cleanStr_(existing);
  if (!bucket && !raw) return "";
  if (bucket && deriveBucket_(raw) !== bucket) {
    return bucket + (cleanStr_(lead.reason) ? " — " + cleanStr_(lead.reason) : "");
  }
  return raw;
}

// The sheet has ONE combined "Outcome/Status (+ reason)" column. Keep the
// human text when it already agrees with the app's bucket; otherwise write
// the app's bucket (plus reason) so Won/Lost/Snoozed round-trip correctly.
function writeStatusCell_(sheet, rowNumber, lead) {
  const live = liveHeaders_(sheet);
  const col = findCol_(live, "raw_status");
  if (col < 0 || !lead) return;
  const v = statusCellValue_(lead, "");
  if (v) sheet.getRange(rowNumber, col + 1).setValue(v);
}

function appendLead_(sheet, lead) {
  const live = liveHeaders_(sheet);
  const row = live.map(header => {
    const field = fieldForHeader_(header);
    if (!field || WRITE_SKIP.indexOf(field) >= 0) return "";
    return valueForSheet_(lead[field]);
  });
  // New leads go to the TOP (row 2, just under the headers). Safe because
  // rows are matched by blp_id, not position.
  sheet.insertRowBefore(2);
  const cols = Math.max(1, live.length);
  if (sheet.getLastRow() >= 3) {
    // Copy formatting from the row below so the new row doesn't inherit
    // the header row's bold/colored styling.
    sheet.getRange(3, 1, 1, cols).copyTo(sheet.getRange(2, 1, 1, cols), { formatOnly: true });
  }
  sheet.getRange(2, 1, 1, cols).setValues([row]);
  return 2;
}

function findRow_(headers, rows, lead) {
  // Stable ID first; row numbers shift when rows are deleted or sorted.
  const idCol = findCol_(headers, "id");
  if (idCol >= 0 && lead && (lead.blp_id != null || lead.id != null)) {
    const id = String(lead.blp_id != null ? lead.blp_id : lead.id).trim();
    if (id) {
      const index = rows.findIndex(r => String(r[idCol]).trim() === id);
      if (index >= 0) return { rowNumber: index + 2 };
    }
  }
  const rowNumber = Number(lead && lead.rowNumber);
  if (rowNumber && rowNumber > 1 && rowNumber <= rows.length + 1) return { rowNumber };
  return null;
}

/* ---------------- header matching ---------------- */

function findCol_(headers, field) {
  const aliases = (FIELD_ALIASES[field] || [field]).map(normalizeHeader_);
  const normalizedHeaders = headers.map(normalizeHeader_);
  // Pass 1: exact match.
  const exact = normalizedHeaders.findIndex(h => h && aliases.indexOf(h) >= 0);
  if (exact >= 0) return exact;
  // Pass 2: header CONTAINS the alias (handles line breaks, extra words,
  // e.g. a header cell of "Temp 1-10 HOT?" still maps to temp).
  return normalizedHeaders.findIndex(h =>
    h && aliases.some(a => a.length >= 4 && h.indexOf(a) >= 0));
}

function fieldForHeaderFuzzy_(allHeaders, header) {
  const idx = allHeaders.indexOf(header);
  return Object.keys(FIELD_ALIASES).find(field => findCol_(allHeaders, field) === idx) || null;
}

function fieldForHeader_(header) {
  const normalized = normalizeHeader_(header);
  return Object.keys(FIELD_ALIASES).find(field =>
    FIELD_ALIASES[field].map(normalizeHeader_).indexOf(normalized) >= 0);
}

function normalizeHeader_(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function valueForSheet_(value) {
  if (Array.isArray(value) || (value && typeof value === "object")) return JSON.stringify(value);
  return value == null ? "" : value;
}

/* ---------------- auth + output ---------------- */

function isAuthorized_(secret) {
  const expected = getSecret_();
  return Boolean(expected) && String(secret || "") === expected;
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
