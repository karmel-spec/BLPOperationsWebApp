// Arnold — Hermes Chief Sales Agent. Writes next-contact drafts in Brigham's
// voice via the Claude API. The sales console calls this to upgrade its
// rule-based drafts; if this function is unconfigured or slow, the console
// keeps the rule-based draft, so failures here are never customer-visible.
const Anthropic = require("@anthropic-ai/sdk");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-blp-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const ARNOLD_MODEL = process.env.ARNOLD_MODEL || "claude-opus-4-8";

/* Brigham's voice, distilled from the corpus the in-app rule drafts use.
   Keep this stable — it is the contract for what Arnold sounds like. */
const BRIGHAM_VOICE_SYSTEM = `You are Arnold, the Chief Sales Agent for Brigham Larson Pianos in Utah. You draft outbound follow-up messages that Brigham (the owner) sends to piano customers from his own email and phone number, so every draft must read exactly like Brigham wrote it himself.

Brigham's voice ground rules:
- Open with "Hi [FirstName]," — nothing more formal.
- Texts: aim for roughly 150-250 characters. Emails: roughly 250-500 characters of body.
- Express uncertainty as trust-building: "my hunch is...", "give-or-take...".
- The deposit-queue reframe is the highest-leverage line when a customer is deciding: a small deposit holds their place in the shop queue and is fully refundable.
- Closes: for texts, "Lmk" works. For emails, when the natural next step is a conversation, close by offering the scheduling link from the lead context (e.g. "Easiest way is to grab a time that works for you here: <scheduling URL>"). Reserve "Would you like to proceed?" for when the customer already has a concrete quote or decision in front of them — never as a generic close.
- Emails sign off exactly: "Thanks,\\nBrigham". Texts don't need a signoff beyond his name being known.
- NEVER write: "hope this email finds you well", the word "investment", or any manufactured urgency ("act now", "limited time").
- Never use the phrase "sales lead" or anything that reveals internal CRM language to the customer.
- Capitalize piano makes properly (Steinway, Yamaha, Kawai, Pleyel, Hailun, etc.).
- Geography: the showroom is in Utah. Only invite a customer to visit the showroom, come by, or stop in when their location clearly puts them in Utah. For out-of-state or far-away customers, NEVER suggest an in-person visit — offer a call, photos, and videos instead (the shop regularly works with out-of-state customers, so distance is normal, not a problem to apologize for).
- Assessing a customer's piano: NEVER ask a customer to bring, drop off, or haul their piano to the shop for analysis, evaluation, or inspection — BLP does not ask that, no matter where the customer lives. The default offer is a call with Brigham (phone or video) so he can give feedback directly — that works best for him. Photos of the piano are sometimes worth requesting (especially for restorations), but frame them as an easy extra, never a requirement.

Recency discipline (hard rule — overrides everything below):
- "Days since last contact" in the lead context is the source of truth for time. NEVER write anything implying you spoke recently ("great chatting today", "thanks for calling earlier", "as we discussed yesterday") unless days since last contact is 0 or 1.
- 2-13 days: reference the gap honestly ("last week", "earlier this month").
- 14-30 days: this is a re-engagement message — acknowledge the silence gracefully ("It's been a little while since we talked about your piano...").
- Over 30 days: assume they barely remember the thread. Re-introduce it ("You reached out back in [month, if a last-contact date is given] about your Packard upright...") and make it effortless to pick back up. No pressure, one easy next step.
- If days since last contact is unknown, write as if it has been a while — never as if it was today.
- The engagement state below sets the tone; days since last contact always wins on any time reference.

Tone by engagement state:
- our_turn / first_contact: advance the sale; reference what they told us; suggest a quick call.
- active: conversational continuation; keep momentum, offer a concrete next step.
- their_turn: gentle nudge, no new asks.
- stale_convo: "you'd mentioned [X] back in [date]..." — re-anchor to their words.
- one_sided: graceful, zero-pressure check-in.
- ghosting: explicit exit ramp — "I'll leave it in your court."
- cold_start / unknown: standard warm opener.

Rules:
- Review the ENTIRE lead row before drafting. The context ends with "Every other field on this lead's row" — read all of it; details like the source, inquiry method, budget band, status, escalation flags, and contact counts routinely change what the right message is. Nothing in the row is filler.
- Draft ONLY for the channel requested. For texts, subject must be an empty string.
- Use only facts given in the lead context. Never invent quotes, prices, dates, or inventory.
- Quotes already given are settled facts. If the lead context shows Brigham already quoted prices (the "already quoted" line, or quotes mentioned in the notes/activity timeline), NEVER offer to "pull together some numbers", "work up a ballpark", or re-quote — reference the existing figures ("the $14.5k restoration and $7.5k QRS numbers I sent over") and move the conversation to the next step instead (answer questions, the deposit-queue reframe, or scheduling a call).
- Read the activity timeline before drafting: it is the record of what has already been said and done with this customer. Never propose something the timeline shows already happened.
- The "Gmail check" section is the live mailbox and outranks the sheet. If it shows a message newer than the sheet's last-contact date — especially one FROM the customer — acknowledge and respond to that latest message; do not draft as if the sheet is current, and never re-ask something the customer already answered by email.
- Links: messages are delivered as plain text, so paste URLs bare and exactly as given in the lead context, with a short natural lead-in (e.g. "here's a quick video tour of our shop: https://youtu.be/..."). NEVER use markdown [text](url), NEVER square-bracket placeholders like [video link], and NEVER invent or alter a URL — if a link is not in the context, do not include one. At most one video link and one scheduling link per message, and only when they genuinely help.
- Plain text only — no markdown, no emoji.`;

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    channel: { type: "string", enum: ["email", "text"] },
    subject: {
      type: "string",
      description: "Email subject line. Empty string for texts.",
    },
    body: { type: "string", description: "The message body, plain text." },
  },
  required: ["channel", "subject", "body"],
  additionalProperties: false,
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "POST required" });
  }

  const accessKey = process.env.BLP_APP_ACCESS_KEY;
  if (!accessKey) {
    return json(501, { ok: false, configured: false, error: "BLP_APP_ACCESS_KEY is not set in Netlify env vars." });
  }
  const providedKey = event.headers["x-blp-key"] || event.headers["X-Blp-Key"] || "";
  if (providedKey !== accessKey) {
    return json(401, { ok: false, error: "Team passcode required or incorrect." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(501, {
      ok: false,
      configured: false,
      error: "Arnold is not connected yet — ANTHROPIC_API_KEY is not set in Netlify env vars.",
      required: ["ANTHROPIC_API_KEY"],
    });
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (error) {
    return json(400, { ok: false, error: "Request body must be JSON." });
  }

  const lead = payload.lead || {};
  const channel = payload.channel === "email" ? "email" : payload.channel === "text" ? "text" : null;
  if (!channel) return json(400, { ok: false, error: "channel must be 'email' or 'text'." });
  if (!lead.name) return json(400, { ok: false, error: "lead.name is required." });
  // Contact-channel guard mirrors the app: never draft for an unreachable channel.
  if (channel === "email" && !String(lead.email || "").includes("@")) {
    return json(400, { ok: false, error: "Lead has no email on file — email draft refused." });
  }
  if (channel === "text" && String(lead.phone || "").replace(/\D/g, "").length < 7) {
    return json(400, { ok: false, error: "Lead has no cell number on file — text draft refused." });
  }

  // Review the mailbox before drafting: recent messages to/from this lead may
  // be newer than anything on the sheet. Hard 3.5s budget so a slow Gmail API
  // can never starve the Claude call; failures never block the draft.
  let gmailReview = null;
  try {
    gmailReview = await Promise.race([
      fetchRecentGmail(lead.email),
      new Promise((resolve) => setTimeout(() => resolve(null), 3500)),
    ]);
  } catch (error) {
    gmailReview = null;
  }

  const context = buildLeadContext(lead, payload.engagement_state, payload.extra_context, payload.calendly_url, payload.video, payload.timeline, gmailReview);

  const client = new Anthropic({
    apiKey,
    timeout: 9000, // stay under the Netlify function timeout; the app falls back to rule drafts
    maxRetries: 0,
  });

  let response;
  try {
    response = await client.messages.create({
      model: ARNOLD_MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: {
        effort: "low",
        format: { type: "json_schema", schema: DRAFT_SCHEMA },
      },
      system: BRIGHAM_VOICE_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Draft the next ${channel === "email" ? "email" : "SMS text"} to this customer.\n\n${context}`,
        },
      ],
    });
  } catch (error) {
    const status = error && error.status ? error.status : 502;
    return json(status >= 400 && status < 600 ? status : 502, {
      ok: false,
      error: "Arnold could not reach the Claude API: " + String(error && error.message ? error.message : error).slice(0, 300),
    });
  }

  if (response.stop_reason === "refusal") {
    return json(502, { ok: false, error: "Arnold declined to draft this message." });
  }

  let draft;
  try {
    const text = response.content.find((block) => block.type === "text");
    draft = JSON.parse(text.text);
  } catch (error) {
    return json(502, { ok: false, error: "Arnold returned an unreadable draft." });
  }

  if (draft.channel !== channel) draft.channel = channel;
  if (channel === "text") draft.subject = "";

  return json(200, {
    ok: true,
    by: "arnold",
    model: response.model,
    draft,
    usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
  });
};

/* Pull the most recent Gmail messages exchanged with the lead so Arnold sees
   communications the sheet may not have logged yet. Requires the Google
   refresh token to carry gmail.readonly (see scripts/gmail-oauth-local-authorize.js);
   returns null when unavailable so drafting proceeds on sheet data alone. */
async function fetchRecentGmail(leadEmail) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const email = String(leadEmail || "").trim();
  if (!clientId || !clientSecret || !refreshToken || !email.includes("@")) return null;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(2500),
  });
  const token = await tokenResponse.json();
  if (!token.access_token) return null;
  if (token.scope && !String(token.scope).includes("gmail.readonly")) {
    return { missing_scope: true };
  }

  const authHeader = { Authorization: `Bearer ${token.access_token}` };
  const q = `(from:${email} OR to:${email}) newer_than:120d`;
  const listResponse = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=3`,
    { headers: authHeader, signal: AbortSignal.timeout(2500) }
  );
  const list = await listResponse.json();
  if (!listResponse.ok || !Array.isArray(list.messages) || !list.messages.length) {
    return { messages: [] };
  }

  const messages = [];
  for (const m of list.messages.slice(0, 3)) {
    const msgResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Date&metadataHeaders=Subject`,
      { headers: authHeader, signal: AbortSignal.timeout(2500) }
    );
    if (!msgResponse.ok) continue;
    const md = await msgResponse.json();
    const header = (name) =>
      (((md.payload || {}).headers) || []).find((h) => h.name === name)?.value || "";
    messages.push({
      date: header("Date"),
      from: header("From"),
      subject: header("Subject"),
      snippet: String(md.snippet || "").slice(0, 250),
    });
  }
  return { messages };
}

function buildLeadContext(lead, engagementState, extraContext, calendlyUrl, video, timeline, gmailReview) {
  const clean = (v) => String(v == null ? "" : v).trim();
  const timelineLines = Array.isArray(timeline)
    ? timeline
        .filter((t) => t && (t.text || t.type))
        .slice(0, 8)
        .map((t) => `  - ${clean(t.date)} [${clean(t.type)}] ${clean(t.text).slice(0, 300)}`)
    : [];
  const lines = [
    `Customer: ${clean(lead.name)}`,
    lead.instrument ? `Interested in: ${clean(lead.instrument)}` : "",
    lead.lead_type ? `Type of work: ${clean(lead.lead_type).split("\n")[0]}` : "",
    lead.piano_type ? `Their piano: ${clean(lead.piano_type).split("\n")[0]}` : "",
    lead.location
      ? `Location: ${clean(lead.location)}${/\butah\b|\bUT\b/i.test(clean(lead.location)) ? " (local to the Utah showroom — an in-person visit may be offered)" : " (NOT local to the Utah showroom — do not suggest an in-person visit)"}`
      : "Location: unknown — do not suggest an in-person visit.",
    lead.pricing_extracted ? `Brigham has ALREADY quoted this customer: ${clean(lead.pricing_extracted)} — reference these figures; do not offer to put numbers together.` : "",
    lead.temp != null ? `Interest level: ${clean(lead.temp)}/10` : "",
    lead.days_since_contact != null
      ? `Days since last contact: ${clean(lead.days_since_contact)}${Number(lead.days_since_contact) > 30 ? " — OVER 30 DAYS OF SILENCE. This is a re-engagement, not a continuation." : ""}`
      : "Days since last contact: unknown — assume it has been a while.",
    lead.last_contact_date ? `Last contact date: ${clean(lead.last_contact_date)}` : "",
    lead.last_action ? `Last outreach was a: ${clean(lead.last_action)}` : "",
    engagementState ? `Engagement state: ${clean(engagementState)}` : "",
    lead.next ? `Planned next step (internal note): ${clean(lead.next)}` : "",
    lead.notes ? `Internal notes from the sheet: ${clean(lead.notes).slice(0, 600)}` : "",
    timelineLines.length ? `Activity timeline (most recent first — what has already happened with this customer):\n${timelineLines.join("\n")}` : "",
    gmailSection(gmailReview),
    calendlyUrl ? `Scheduling link (use this to offer a call time): ${clean(calendlyUrl)}` : "",
    video && video.url ? `Approved video for this customer ("${clean(video.title)}"): ${clean(video.url)}` : "",
    extraContext ? `Extra context: ${clean(extraContext).slice(0, 600)}` : "",
    fullRowSection(lead),
  ];
  return lines.filter(Boolean).join("\n");
}

function gmailSection(gmailReview) {
  if (!gmailReview) return "";
  if (gmailReview.missing_scope) {
    return "Gmail check: unavailable (mailbox access not granted yet) — the sheet may be missing recent emails; be careful not to contradict anything the customer may have sent recently.";
  }
  if (!Array.isArray(gmailReview.messages) || !gmailReview.messages.length) {
    return "Gmail check: no email exchanged with this customer in the last 120 days.";
  }
  const lines = gmailReview.messages.map(
    (m) => `  - ${m.date} | from ${m.from} | "${m.subject}" — ${m.snippet}`
  );
  return `Gmail check — most recent email actually exchanged with this customer (may be newer than the sheet):\n${lines.join("\n")}`;
}

/* Everything on the lead's row that the curated lines above didn't already
   surface. Arnold's contract requires reviewing all of it before drafting. */
const CURATED_FIELDS = new Set([
  "name", "email", "phone", "instrument", "lead_type", "piano_type",
  "location", "pricing_extracted", "temp", "days_since_contact",
  "last_contact_date", "last_action", "next", "notes",
]);

function fullRowSection(lead) {
  const clean = (v) => String(v == null ? "" : v).trim();
  const rows = [];
  let budget = 3000; // keep the prompt bounded even on messy rows
  for (const [key, value] of Object.entries(lead || {})) {
    if (CURATED_FIELDS.has(key) || value == null) continue;
    const rendered = typeof value === "object" ? JSON.stringify(value) : clean(value);
    if (!rendered || rendered === "false" || rendered === "0") continue;
    const line = `  - ${key}: ${rendered.slice(0, 300)}`;
    if (budget - line.length < 0) break;
    budget -= line.length;
    rows.push(line);
  }
  if (!rows.length) return "";
  return `Every other field on this lead's row:\n${rows.join("\n")}`;
}

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}
