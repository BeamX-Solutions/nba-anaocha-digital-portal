import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Daily dues deadline reminders (invoked by pg_cron; see migration
// 20260703100000). Emails every outstanding member 7 days and 1 day before
// each active dues item's deadline, with an in-app notification, deduplicated
// through dues_reminder_log.
//
// Deploy with JWT verification DISABLED; callers authenticate with the
// x-cron-secret header (or the service role key, for manual runs).

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = Deno.env.get("RESEND_FROM") || "NBA Anaocha <noreply@beamxsolutions.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://nba-anaocha-digital-portal.vercel.app";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
   .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

// Same tier logic as verify-payment / src/lib/constants.ts.
function dueAmount(item: any, yearOfCall: string | null, rank: string | null): number {
  if (!item.is_tiered) return Number(item.flat_amount ?? 0);
  if ((rank === "san" || rank === "bencher") && item.amount_san != null) return Number(item.amount_san);
  const parsed = parseInt(yearOfCall ?? "");
  const years = isNaN(parsed) ? 0 : Math.max(0, new Date().getFullYear() - parsed);
  if (years < 5)  return Number(item.amount_0_4     ?? 0);
  if (years < 10) return Number(item.amount_5_9     ?? 0);
  if (years < 15) return Number(item.amount_10_14   ?? 0);
  return Number(item.amount_15_plus ?? 0);
}

function reminderHtml(name: string, item: any, amount: number, deadline: string, daysLeft: number): string {
  const when = daysLeft === 1 ? "is due <strong>tomorrow</strong>" : `is due in <strong>${daysLeft} days</strong>`;
  const action = item.requires_upload
    ? `<p>Please log in to the portal and upload your proof of payment before the deadline.</p>`
    : `<p>Amount due: <strong>&#8358;${amount.toLocaleString("en-NG")}</strong>. You can pay securely on the portal in a few clicks.</p>`;
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <img src="${SITE_URL}/nba-logo.png" alt="NBA Anaocha" width="44" height="44" style="display:block;border-radius:6px" />
        <h2 style="color:#1a5c38;margin:0">NBA Anaocha Branch Portal</h2>
      </div>
      <p>Dear ${esc(name)},</p>
      <p>This is a friendly reminder that <strong>${esc(item.title)}</strong> ${when} (${deadline}).</p>
      ${action}
      <table cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0"><tr><td align="center">
        <a href="${SITE_URL}/anaocha/dues" style="display:inline-block;background-color:#1a5c38;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 32px;border-radius:6px">View My Dues</a>
      </td></tr></table>
      <p style="font-size:13px;color:#666">If you have already settled this, kindly disregard this reminder.</p>
      <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
    </div>`;
}

Deno.serve(async (req) => {
  try {
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");
    const bearer = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const authorized =
      (cronSecret && req.headers.get("x-cron-secret") === cronSecret) || bearer === serviceKey;
    if (!authorized) return new Response(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    if (!RESEND_API_KEY) return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500 });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, serviceKey);

    // Active dues with a deadline 1–7 days out (Lagos dates).
    const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }));
    const { data: items } = await admin
      .from("dues_items").select("*").eq("is_active", true).not("deadline", "is", null);

    const due = (items || []).map((item: any) => {
      const daysLeft = Math.round((new Date(item.deadline).getTime() - today.getTime()) / 86_400_000);
      // '7d' covers 2–7 days out so a missed cron day still catches members once.
      const stage = daysLeft === 1 ? "1d" : daysLeft >= 2 && daysLeft <= 7 ? "7d" : null;
      return { item, daysLeft, stage };
    }).filter((d) => d.stage);

    if (due.length === 0) return new Response(JSON.stringify({ sent: 0, message: "No deadlines within 7 days" }), { status: 200 });

    const { data: members } = await admin
      .from("profiles")
      .select("user_id, first_name, surname, email, year_of_call, rank")
      .eq("portal_access", "anaocha").eq("status", "active").not("email", "is", null);

    let sent = 0;
    for (const { item, daysLeft, stage } of due) {
      const [{ data: payments }, { data: logged }] = await Promise.all([
        admin.from("dues_payments").select("user_id, status").eq("dues_item_id", item.id),
        admin.from("dues_reminder_log").select("user_id").eq("dues_item_id", item.id).eq("stage", stage),
      ]);
      const covered = new Set((payments || [])
        .filter((p: any) => ["paid", "verified", "uploaded"].includes(p.status))
        .map((p: any) => p.user_id));
      const alreadyReminded = new Set((logged || []).map((l: any) => l.user_id));

      const targets = (members || []).filter(
        (m: any) => !covered.has(m.user_id) && !alreadyReminded.has(m.user_id)
      );
      if (targets.length === 0) continue;

      const deadlineStr = new Date(item.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

      // Personalised emails via Resend batch (≤100 per call).
      for (let i = 0; i < targets.length; i += 100) {
        const chunk = targets.slice(i, i + 100);
        const res = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify(chunk.map((m: any) => ({
            from: FROM,
            to: m.email,
            subject: daysLeft === 1
              ? `Reminder: ${item.title} is due tomorrow`
              : `Reminder: ${item.title} is due in ${daysLeft} days`,
            html: reminderHtml(
              [m.surname, m.first_name].filter(Boolean).join(" ") || "Colleague",
              item, dueAmount(item, m.year_of_call, m.rank), deadlineStr, daysLeft,
            ),
          }))),
        });
        if (!res.ok) {
          console.error("Resend batch failed:", await res.text());
          continue; // no log rows written → retried on the next daily run
        }
        await admin.from("notifications").insert(chunk.map((m: any) => ({
          user_id: m.user_id,
          title: `Dues Reminder: ${item.title}`,
          message: daysLeft === 1
            ? `${item.title} is due tomorrow (${deadlineStr}). Please settle it on the portal.`
            : `${item.title} is due in ${daysLeft} days (${deadlineStr}). Please settle it on the portal.`,
          type: "dues",
        })));
        await admin.from("dues_reminder_log").insert(chunk.map((m: any) => ({
          dues_item_id: item.id, user_id: m.user_id, stage,
        })));
        sent += chunk.length;
        if (i + 100 < targets.length) await new Promise((r) => setTimeout(r, 600));
      }
    }

    return new Response(JSON.stringify({ sent }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("dues-reminders error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
