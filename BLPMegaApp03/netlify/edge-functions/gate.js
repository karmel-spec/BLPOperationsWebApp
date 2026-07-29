// Site-wide password gate for the whole static mega-app (33 modules).
// Runs on Netlify's Edge runtime so it can intercept every request,
// including direct links straight into a module — not just the homepage.
//
// Password: falls back to "pianoman" (same convention as Piano Log and
// Sales Console). Override in Netlify's dashboard (Site settings ->
// Environment variables) by setting BLP_APP_ACCESS_KEY for a different
// value in production.
const COOKIE = "blp_gate";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function password() {
  return Deno.env.get("BLP_APP_ACCESS_KEY") || "pianoman";
}

async function expectedToken() {
  const bytes = new TextEncoder().encode(`blp-mega-gate|${password()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(req, name) {
  const header = req.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim();
  }
  return null;
}

export default async (request, context) => {
  const url = new URL(request.url);
  const { pathname } = url;

  // Login page, its own assets, and Netlify internals stay open. The login
  // POST target is handled below, not passed through, so it's deliberately
  // left out of this list.
  const open =
    pathname === "/login.html" ||
    pathname.startsWith("/assets/brand/") ||
    pathname.startsWith("/.netlify/");
  if (open) return context.next();

  const expected = await expectedToken();

  if (request.method === "POST" && pathname === "/api/blp-login") {
    const form = await request.formData();
    const entered = String(form.get("password") || "");
    const next = String(form.get("next") || "/");
    if (entered === password()) {
      const res = new Response(null, {
        status: 303,
        headers: { Location: next.startsWith("/") ? next : "/" },
      });
      res.headers.append(
        "Set-Cookie",
        `${COOKIE}=${expected}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${MAX_AGE}`
      );
      return res;
    }
    return Response.redirect(`${url.origin}/login.html?error=1`, 303);
  }

  const cookie = getCookie(request, COOKIE);
  if (cookie === expected) return context.next();

  const loginUrl = new URL("/login.html", url.origin);
  loginUrl.searchParams.set("next", pathname);
  return Response.redirect(loginUrl.toString(), 303);
};

export const config = { path: "/*" };
