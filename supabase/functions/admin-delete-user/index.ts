import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    // Identify the caller from their JWT; only admins may delete accounts.
    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: { user: caller }, error: authErr } = await admin.auth.getUser(token);
    if (authErr || !caller) return json({ error: "Not authenticated" }, 401);

    const { data: callerProfile } = await admin
      .from("profiles").select("is_admin").eq("user_id", caller.id).maybeSingle();
    if (!callerProfile?.is_admin) return json({ error: "Admin access required" }, 403);

    const { user_id } = await req.json();
    if (!user_id) return json({ error: "user_id is required" }, 400);
    if (user_id === caller.id) return json({ error: "You cannot delete your own account" }, 400);

    const { data: target } = await admin
      .from("profiles")
      .select("user_id, first_name, surname, email, is_admin, lbian")
      .eq("user_id", user_id)
      .maybeSingle();
    if (!target) return json({ error: "Member not found" }, 404);
    if (target.is_admin) return json({ error: "Admin accounts cannot be deleted from the portal" }, 403);

    const memberName = [target.surname, target.first_name].filter(Boolean).join(" ") || "Member";

    // Courtesy notice — must go out before the auth account (and its email) is gone.
    if (target.email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ type: "account_deleted", to: target.email, name: memberName }),
        });
      } catch (e) {
        console.error("account_deleted email failed:", e);
      }
    }

    // Best-effort cleanup of the member's uploaded files.
    for (const bucket of ["avatars", "uploads"]) {
      try {
        const { data: files } = await admin.storage.from(bucket).list(user_id, { limit: 100 });
        if (files?.length) {
          await admin.storage.from(bucket).remove(files.map((f) => `${user_id}/${f.name}`));
        }
      } catch (e) {
        console.error(`storage cleanup (${bucket}) failed:`, e);
      }
    }

    // Deleting the auth user cascades to profiles, applications, notifications,
    // payments and dues_payments (all FK ... on delete cascade).
    const { error: delErr } = await admin.auth.admin.deleteUser(user_id);
    if (delErr) return json({ error: delErr.message }, 500);

    await admin.from("audit_logs").insert({
      admin_id: caller.id,
      action: "member_deleted",
      entity_type: "profile",
      entity_id: user_id,
      details: { member_email: target.email, member_name: memberName, lbian: target.lbian },
    });

    return json({ success: true });
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
});
