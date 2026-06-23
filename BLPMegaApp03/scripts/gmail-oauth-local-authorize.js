#!/usr/bin/env node
const http = require("http");
const crypto = require("crypto");

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const port = Number(process.env.GOOGLE_OAUTH_LOCAL_PORT || 7777);
const redirectUri = process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/oauth2callback`;
const scope = "https://www.googleapis.com/auth/gmail.send";
const state = crypto.randomBytes(16).toString("hex");

if (!clientId || !clientSecret) {
  console.error("Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.");
  console.error("Example:");
  console.error("GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/gmail-oauth-local-authorize.js");
  process.exit(1);
}

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", clientId);
authUrl.searchParams.set("redirect_uri", redirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", scope);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");
authUrl.searchParams.set("include_granted_scopes", "true");
authUrl.searchParams.set("state", state);

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, redirectUri);
  if (requestUrl.pathname !== "/oauth2callback") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
    return;
  }

  if (requestUrl.searchParams.get("state") !== state) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("State mismatch. Close this window and rerun the helper.");
    closeServer();
    return;
  }

  const code = requestUrl.searchParams.get("code");
  if (!code) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("No authorization code returned by Google.");
    closeServer();
    return;
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const text = await tokenResponse.text();
    const token = JSON.parse(text);
    if (!tokenResponse.ok || !token.refresh_token) {
      throw new Error(text);
    }

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Authorization complete. Return to Codex or your terminal for the Netlify values.");
    console.log("\nAuthorization complete.");
    console.log("Copy this secret into Netlify. Do not commit it to GitHub.");
    console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
    console.log(`GMAIL_SEND_AS=brigham@brighamlarsonpianos.com`);
    console.log("SALES_EMAIL_BCC=info@brighamlarsonpianos.com");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Token exchange failed. Return to the terminal for details.");
    console.error("Token exchange failed:");
    console.error(String(error.message || error));
  } finally {
    closeServer();
  }
});

server.listen(port, () => {
  console.log("Gmail OAuth helper is waiting for authorization.");
  console.log(`Redirect URI: ${redirectUri}`);
  console.log("\nOpen this URL and sign in as brigham@brighamlarsonpianos.com:\n");
  console.log(authUrl.toString());
  console.log("\nKeep this process running until Google redirects back.");
});

function closeServer() {
  setTimeout(() => server.close(), 500);
}
