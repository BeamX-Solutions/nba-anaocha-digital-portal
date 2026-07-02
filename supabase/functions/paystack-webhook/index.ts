import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Paystack server-to-server webhook: the safety net that records successful
// charges even when the member's browser never runs the client-side
// verify-payment callback (tab closed, connection lost, device died).
//
// Deploy with JWT verification DISABLED (Paystack sends no Supabase JWT);
// authenticity is proven by the x-paystack-signature HMAC instead.
// Register in Paystack Dashboard → Settings → API Keys & Webhooks:
//   https://<project>.supabase.co/functions/v1/paystack-webhook

const ok = (message: string) =>
  new Response(JSON.stringify({ received: true, message }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });

async function signatureIsValid(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!secret || !signature) return false;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-512" }, false, ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");
  // Constant-time comparison.
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const rawBody = await req.text();

    if (!(await signatureIsValid(rawBody, req.headers.get("x-paystack-signature")))) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") return ok(`Ignored event: ${event.event}`);

    const data = event.data;
    const reference = data?.reference;
    if (!reference) return ok("No reference in payload");

    // The checkout attaches user_id / entity_type / entity_id as metadata.
    const meta = data.metadata || {};
    let user_id = meta.user_id ?? null;
    let entity_type = meta.entity_type ?? null;
    const entity_id = meta.entity_id ?? null;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Legacy/manual payments carry no metadata — attribute by customer email.
    if (!user_id && data.customer?.email) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/profiles?select=user_id&email=ilike.${encodeURIComponent(data.customer.email)}&limit=1`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const rows = await res.json();
      if (rows?.[0]?.user_id) {
        user_id = rows[0].user_id;
        entity_type = "unattributed";
      }
    }
    if (!user_id) return ok("Cannot attribute payment to a member; reconcile via Paystack dashboard");

    // Reuse the canonical recording path — verify-payment re-verifies with
    // Paystack, validates amount/payer, is replay-safe, and emails the receipt.
    const res = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reference, user_id, entity_type, entity_id }),
    });
    const result = await res.json().catch(() => ({}));
    console.log(`webhook ${reference}: verify-payment → ${res.status}`, result?.message ?? "");

    // Always 200 — Paystack retries non-2xx, and a validation rejection
    // (e.g. already recorded by the client callback) is not a delivery failure.
    return ok(result?.success ? "Recorded" : `Not recorded: ${result?.message ?? res.status}`);
  } catch (err) {
    console.error("webhook error:", err);
    // Non-2xx makes Paystack retry the delivery — right for transient faults.
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
});
