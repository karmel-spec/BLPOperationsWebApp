#!/usr/bin/env node
/**
 * One-time helper to mint a Gmail refresh token for the info@brighamlarsonpianos.com
 * mailbox, used by netlify/functions/send-sales-email.js.
 *
 * Zero npm dependencies — pure Node. Uses the OAuth "loopback" flow:
 * it starts a tiny local server, opens (or prints) the Google consent URL, captures
 * the auth code Google redirects back, and exchanges it for a refresh token.
 *
 * PREREQUISITES (Google Cloud Console, one time):
 *   1. Enable the Gmail API on your project.
 *   2. Create an OAuth client ID of type "Web application".
 *   3. Add this redirect URI to that client:  http://localhost:53682/oauth2callback
 *
 * RUN IT:
 *   GMAIL_CLIENT_ID=xxx GMAIL_CLIENT_SECRET=yyy node scripts/get-gmail-refresh-token.js
 *
 * Then sign in as info@brighamlarsonpianos.com and approve. The script prints the
 * GMAIL_REFRESH_TOKEN to paste into Netlify env vars.
 */

const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;
const SCOPE = "https://www.googleapis.com/auth/gmail.send";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET env vars first.");
  process.exit(1);
}

const state = crypto.randomBytes(16).toString("hex");
const authUrl =
  "https://accounts.google.com/o/oauth2/v2/auth?" +
  new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    prompt: "consent", // force a refresh_token even on re-consent
    state,
  }).toString();

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  if (u.pathname !== "/oauth2callback") {
    res.writeHead(404).end();
    return;
  }
  if (u.searchParams.get("state") !== state) {
    res.writeHead(400).end("State mismatch — try again.");
    return;
  }
  const code = u.searchParams.get("code");
  if (!code) {
    res.writeHead(400).end("No code returned: " + (u.searchParams.get("error") || "unknown"));
    return;
  }
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });
    const data = await tokenRes.json();
    if (!data.refresh_token) {
      res.writeHead(500).end("No refresh_token returned. Revoke prior access and retry.");
      console.error("\nToken response:", data);
      server.close();
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" }).end(
      "<h2>Got it. You can close this tab and return to the terminal.</h2>"
    );
    console.log("\n✅ Success. Set this in Netlify:\n");
    console.log("GMAIL_REFRESH_TOKEN=" + data.refresh_token + "\n");
  } catch (err) {
    res.writeHead(500).end("Token exchange failed: " + err.message);
    console.error(err);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log("\nOpen this URL, sign in as info@brighamlarsonpianos.com, and approve:\n");
  console.log(authUrl + "\n");
  console.log(`Waiting for the redirect to ${REDIRECT_URI} ...`);
});
