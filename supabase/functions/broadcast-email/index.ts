import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("RESEND_FROM") || "NBA Anaocha <noreply@beamxsolutions.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://nba-anaocha-digital-portal.vercel.app";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function buildHtml(title: string, message: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <img src="${SITE_URL}/nba-logo.png" alt="NBA Anaocha" width="44" height="44" style="display:block;border-radius:6px" />
        <h2 style="color:#1a5c38;margin:0">NBA Anaocha Branch Portal</h2>
      </div>
      <h3 style="color:#1a1a2e;margin-bottom:8px">${title}</h3>
      <div style="background:#f9f9f9;border-left:4px solid #1a5c38;padding:16px;border-radius:4px;white-space:pre-wrap;font-size:14px;color:#333;line-height:1.6">${message}</div>
      <p style="margin-top:16px;font-size:13px;color:#666">Log in to the portal for more details.</p>
      <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
    </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    if (!RESEND_API_KEY) return json({ error: "RESEND_API_KEY not set" }, 500);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Only admins may broadcast. Identify the caller from their JWT, then
    // check the is_admin flag with the service role (bypasses RLS).
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: { user: caller }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !caller) return json({ error: "Not authenticated" }, 401);

    const { data: callerProfile } = await admin
      .from("profiles").select("is_admin").eq("user_id", caller.id).maybeSingle();
    if (!callerProfile?.is_admin) return json({ error: "Admin access required" }, 403);

    const { title, message, user_ids } = await req.json();
    if (!title?.trim() || !message?.trim()) return json({ error: "title and message are required" }, 400);

    // Resolve recipient emails: specific users, or every portal member.
    let query = admin.from("profiles").select("email").eq("portal_access", "anaocha").not("email", "is", null);
    if (Array.isArray(user_ids) && user_ids.length > 0) query = query.in("user_id", user_ids);
    const { data: rows, error: profErr } = await query;
    if (profErr) return json({ error: profErr.message }, 500);

    const emails = [...new Set((rows || []).map((r) => r.email).filter(Boolean))] as string[];
    if (emails.length === 0) return json({ error: "No recipients with an email address" }, 400);

    const html = buildHtml(esc(title.trim()), esc(message.trim()));
    const subject = title.trim();

    // Resend batch endpoint accepts up to 100 messages per call.
    let sent = 0;
    const failures: string[] = [];
    for (let i = 0; i < emails.length; i += 100) {
      const chunk = emails.slice(i, i + 100);
      const res = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map((to) => ({ from: FROM, to, subject, html }))),
      });
      if (res.ok) {
        sent += chunk.length;
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Resend batch error:", err);
        failures.push(...chunk);
      }
      // Stay under Resend's requests-per-second limit between chunks.
      if (i + 100 < emails.length) await new Promise((r) => setTimeout(r, 600));
    }

    return json({ success: failures.length === 0, sent, failed: failures.length });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
