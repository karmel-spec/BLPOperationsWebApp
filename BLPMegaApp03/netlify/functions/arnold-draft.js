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
- Workhorse closes: "Lmk" (texts) and "Would you like to proceed?" (emails).
- Emails sign off exactly: "Thanks,\\nBrigham". Texts don't need a signoff beyond his name being known.
- NEVER write: "hope this email finds you well", the word "investment", or any manufactured urgency ("act now", "limited time").
- Never use the phrase "sales lead" or anything that reveals internal CRM language to the customer.
- Capitalize piano makes properly (Steinway, Yamaha, Kawai, Pleyel, Hailun, etc.).

Tone by engagement state:
- our_turn / first_contact: advance the sale; reference what they told us; suggest a quick call.
- active: conversational continuation; keep momentum, offer a concrete next step.
- their_turn: gentle nudge, no new asks.
- stale_convo: "you'd mentioned [X] back in [date]..." — re-anchor to their words.
- one_sided: graceful, zero-pressure check-in.
- ghosting: explicit exit ramp — "I'll leave it in your court."
- cold_start / unknown: standard warm opener.

Rules:
- Draft ONLY for the channel requested. For texts, subject must be an empty string.
- Use only facts given in the lead context. Never invent quotes, prices, dates, or inventory.
- If a past quote is provided, you may reference it. If a video/link is provided in context, you may include it naturally.
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

  const context = buildLeadContext(lead, payload.engagement_state, payload.extra_context);

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

function buildLeadContext(lead, engagementState, extraContext) {
  const clean = (v) => String(v == null ? "" : v).trim();
  const lines = [
    `Customer: ${clean(lead.name)}`,
    lead.instrument ? `Interested in: ${clean(lead.instrument)}` : "",
    lead.lead_type ? `Type of work: ${clean(lead.lead_type).split("\n")[0]}` : "",
    lead.piano_type ? `Their piano: ${clean(lead.piano_type).split("\n")[0]}` : "",
    lead.location ? `Location: ${clean(lead.location)}` : "",
    lead.pricing_extracted ? `Past quote(s): ${clean(lead.pricing_extracted)}` : "",
    lead.temp != null ? `Interest level: ${clean(lead.temp)}/10` : "",
    lead.days_since_contact != null ? `Days since last contact: ${clean(lead.days_since_contact)}` : "",
    lead.last_action ? `Last outreach was a: ${clean(lead.last_action)}` : "",
    engagementState ? `Engagement state: ${clean(engagementState)}` : "",
    lead.next ? `Planned next step (internal note): ${clean(lead.next)}` : "",
    lead.notes ? `Internal notes from the sheet: ${clean(lead.notes).slice(0, 600)}` : "",
    extraContext ? `Extra context: ${clean(extraContext).slice(0, 600)}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}
