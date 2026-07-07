// Arnold — Hermes Chief Sales Agent. Morning oversight digest.
// Runs on a Netlify schedule (see netlify.toml): pulls the live Leads Log,
// computes what needs attention (new leads, hot-going-cold, lonely leads,
// Arnold takeovers), asks Claude to write the digest in Arnold's voice, and
// texts it to Brigham via Twilio. If the Claude call fails, a deterministic
// plain digest is sent instead — the digest never silently skips a morning.
const Anthropic = require("@anthropic-ai/sdk");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-blp-key",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Content-Type": "application/json",
};

const ARNOLD_MODEL = process.env.ARNOLD_MODEL || "claude-opus-4-8";
const ARNOLD_TAKEOVER_DAYS = 30;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders };
  }

  // Scheduled invocations arrive from Netlify's scheduler (not routable
  // externally). Manual test runs must present the team key.
  const accessKey = process.env.BLP_APP_ACCESS_KEY;
  const providedKey = (event.headers && (event.headers["x-blp-key"] || event.headers["X-Blp-Key"])) || "";
  const isScheduled = isScheduledInvocation(event);
  if (!isScheduled) {
    if (!accessKey) {
      return json(501, { ok: false, configured: false, error: "BLP_APP_ACCESS_KEY is not set in Netlify env vars." });
    }
    if (providedKey !== accessKey) {
      return json(401, { ok: false, error: "Team passcode required or incorrect." });
    }
  }

  const missing = [];
  if (!process.env.SALES_LEADS_APPS_SCRIPT_URL) missing.push("SALES_LEADS_APPS_SCRIPT_URL");
  if (!process.env.SALES_LEADS_SYNC_SECRET) missing.push("SALES_LEADS_SYNC_SECRET");
  if (!process.env.TWILIO_ACCOUNT_SID) missing.push("TWILIO_ACCOUNT_SID");
  if (!process.env.TWILIO_AUTH_TOKEN) missing.push("TWILIO_AUTH_TOKEN");
  if (!process.env.TWILIO_SMS_FROM_NUMBER) missing.push("TWILIO_SMS_FROM_NUMBER");
  if (!process.env.BRIGHAM_LEAD_ALERT_PHONE) missing.push("BRIGHAM_LEAD_ALERT_PHONE");
  if (missing.length) {
    return json(501, { ok: false, configured: false, error: "Arnold's digest is not fully configured.", required: missing });
  }

  // 1. Pull the live leads snapshot.
  let leads;
  try {
    leads = await fetchLeads();
  } catch (error) {
    return json(502, { ok: false, error: "Could not read the Leads Log: " + String(error.message || error).slice(0, 300) });
  }

  // 2. Compute what needs attention.
  const report = buildReport(leads);

  // 3. Write the digest — Arnold's voice via Claude, deterministic fallback.
  let digest = null;
  let wroteWith = "fallback";
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      digest = await writeDigestWithClaude(report);
      wroteWith = ARNOLD_MODEL;
    } catch (error) {
      digest = null;
    }
  }
  if (!digest) digest = plainDigest(report);

  // 4. Text it to Brigham.
  const dryRun = !isScheduled && event.queryStringParameters && event.queryStringParameters.dry_run === "1";
  let smsSid = null;
  if (!dryRun) {
    try {
      smsSid = await sendSms(process.env.BRIGHAM_LEAD_ALERT_PHONE, digest);
    } catch (error) {
      return json(502, { ok: false, error: "Digest written but SMS failed: " + String(error.message || error).slice(0, 300), digest, report });
    }
  }

  return json(200, { ok: true, scheduled: isScheduled, dry_run: !!dryRun, wrote_with: wroteWith, sms_sid: smsSid, digest, report });
};

function isScheduledInvocation(event) {
  // Netlify scheduled functions are invoked with a body containing next_run
  // and are not reachable at a public URL.
  try {
    const body = JSON.parse(event.body || "{}");
    return typeof body.next_run === "string";
  } catch (error) {
    return false;
  }
}

async function fetchLeads() {
  const url = new URL(process.env.SALES_LEADS_APPS_SCRIPT_URL);
  url.searchParams.set("secret", process.env.SALES_LEADS_SYNC_SECRET);
  url.searchParams.set("action", "list");
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) throw new Error("Apps Script read failed (" + response.status + ")");
  const data = JSON.parse(text);
  if (!data.ok || !Array.isArray(data.leads)) throw new Error("Apps Script returned no leads array");
  return data.leads;
}

/* Minimal mirror of the console's normalization — enough to attribute reps
   and staleness. Keep alias lists in sync with the sales console. */
function repKey(value) {
  const s = String(value || "").toLowerCase();
  const m = s.match(/\bw\s*:\s*([^,;|/]+)/i);
  const raw = (m ? m[1] : s).toLowerCase().trim();
  const compact = raw.replace(/[^a-z]/g, "");
  if (["bl", "brighamlarson"].includes(compact)) return "brigham";
  if (["ar", "arnold", "sl", "sally", "s"].includes(compact)) return "arnold";
  if (["kl", "karmel", "k"].includes(compact)) return "karmel";
  if (["a", "admin"].includes(compact)) return "admin";
  if (raw.includes("arnold") || raw.includes("sally")) return "arnold";
  if (raw.includes("brig")) return "brigham";
  if (raw.includes("karmel")) return "karmel";
  if (raw.includes("admin")) return "admin";
  return "brigham";
}

function buildReport(rawLeads) {
  const leads = rawLeads.map((l) => {
    const outcome = String(l.outcome || l.status_bucket || "Active");
    const active = !["Won", "Lost", "Inactive", "Snoozed"].includes(outcome);
    const days = Number(l.days_since_contact != null ? l.days_since_contact : l.days) || 0;
    const age = Number(l.days) || 0;
    return {
      name: [l.first, l.last].filter(Boolean).join(" ") || l.name || "Unknown",
      rep: repKey(l.rep_working || l.rep),
      temp: Number(l.temp) || 0,
      days,
      age,
      active,
      instrument: String(l.instrument || "").trim(),
    };
  });

  const active = leads.filter((l) => l.active);
  const names = (list, n = 5) => list.slice(0, n).map((l) => `${l.name} (${l.days}d${l.temp ? ", " + l.temp + "/10" : ""})`);

  const newLeads = active.filter((l) => l.age <= 2);
  const hotGoingCold = active.filter((l) => l.temp >= 8 && l.days >= 3).sort((a, b) => b.days - a.days);
  const lonely = active.filter((l) => l.days > 7).sort((a, b) => b.days - a.days);
  const takeovers = active.filter((l) => l.rep === "brigham" && l.days > ARNOLD_TAKEOVER_DAYS);

  return {
    total_active: active.length,
    new_last_2_days: { count: newLeads.length, names: names(newLeads) },
    hot_going_cold: { count: hotGoingCold.length, names: names(hotGoingCold) },
    lonely_over_7_days: { count: lonely.length, names: names(lonely, 3) },
    arnold_takeovers: { count: takeovers.length, names: names(takeovers, 3) },
  };
}

async function writeDigestWithClaude(report) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 8000, maxRetries: 0 });
  const response = await client.messages.create({
    model: ARNOLD_MODEL,
    max_tokens: 400,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
    system:
      "You are Arnold, Chief Sales Agent for Brigham Larson Pianos. Each morning you text Brigham a sales digest. Write ONE plain-text SMS under 450 characters. Start with 'Arnold's morning digest:'. Be direct and specific — lead with whatever most needs Brigham's attention today (hot leads going cold beat everything else). Name names. No emoji, no markdown, no fluff. If nothing is urgent, say so in one line and give the totals.",
    messages: [
      {
        role: "user",
        content: "Today's numbers from the Leads Log:\n" + JSON.stringify(report, null, 2),
      },
    ],
  });
  if (response.stop_reason === "refusal") throw new Error("refused");
  const text = response.content.find((b) => b.type === "text");
  const digest = text && text.text ? text.text.trim() : "";
  if (!digest) throw new Error("empty digest");
  return digest.slice(0, 900);
}

function plainDigest(r) {
  const lines = [
    "Arnold's morning digest:",
    `${r.total_active} active leads.`,
    r.hot_going_cold.count ? `HOT going cold (${r.hot_going_cold.count}): ${r.hot_going_cold.names.join(", ")}.` : "No hot leads going cold.",
    r.new_last_2_days.count ? `New (${r.new_last_2_days.count}): ${r.new_last_2_days.names.join(", ")}.` : "",
    r.lonely_over_7_days.count ? `Lonely 7d+ (${r.lonely_over_7_days.count}): ${r.lonely_over_7_days.names.join(", ")}.` : "",
    r.arnold_takeovers.count ? `Arnold holding ${r.arnold_takeovers.count} of Brigham's ${ARNOLD_TAKEOVER_DAYS}d+ leads.` : "",
  ];
  return lines.filter(Boolean).join(" ").slice(0, 900);
}

async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const form = new URLSearchParams({ To: to, From: process.env.TWILIO_SMS_FROM_NUMBER, Body: body });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Twilio error " + response.status);
  return data.sid || null;
}

function json(statusCode, body) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(body) };
}
