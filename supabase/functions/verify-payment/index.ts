import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const fail = (message: string, status = 400) =>
  new Response(JSON.stringify({ success: false, message }), {
    status, headers: { ...cors, "Content-Type": "application/json" },
  });

// Server-side copy of the client fee table (src/lib/constants.ts). The amount
// sent to Paystack is set in the browser and therefore untrusted.
const SERVICE_FEES: Record<string, number> = {
  nba_diary:         6000,
  nba_id_card:       5000,
  nba_vehicle_plate: 230000,
};

// Server-side copy of getDueAmount (src/lib/constants.ts).
function expectedDueAmount(
  item: {
    is_tiered: boolean; flat_amount: number | null; amount_san: number | null;
    amount_0_4: number | null; amount_5_9: number | null;
    amount_10_14: number | null; amount_15_plus: number | null;
  },
  yearOfCall: string | null,
  rank: string | null,
): number {
  if (!item.is_tiered) return Number(item.flat_amount ?? 0);
  if ((rank === "san" || rank === "bencher") && item.amount_san != null) {
    return Number(item.amount_san);
  }
  const parsed = parseInt(yearOfCall ?? "");
  const years = isNaN(parsed) ? 0 : Math.max(0, new Date().getFullYear() - parsed);
  if (years < 5)  return Number(item.amount_0_4     ?? 0);
  if (years < 10) return Number(item.amount_5_9     ?? 0);
  if (years < 15) return Number(item.amount_10_14   ?? 0);
  return Number(item.amount_15_plus ?? 0);
}

// Fire-and-forget receipt email; a mail failure must never fail the payment.
async function sendReceiptEmail(
  supabase: ReturnType<typeof createClient>,
  user_id: string,
  description: string,
  amount: number,
  reference: string,
) {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, first_name, surname")
      .eq("user_id", user_id)
      .maybeSingle();
    if (!profile?.email) return;
    const name = [profile.surname, profile.first_name].filter(Boolean).join(" ") || "Member";
    await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type: "payment_receipt", to: profile.email, name, description, amount, reference }),
    });
  } catch (e) {
    console.error("receipt email failed:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { reference, user_id, entity_type, entity_id } = await req.json();

    if (!reference || !user_id) {
      return new Response(JSON.stringify({ success: false, message: "Missing reference or user_id" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 1. Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}` } }
    );
    const ps = await paystackRes.json();

    if (!ps.status || ps.data?.status !== "success") {
      return fail("Payment not verified by Paystack");
    }
    if (ps.data.currency && ps.data.currency !== "NGN") {
      return fail("Unexpected payment currency");
    }

    const amountNaira = ps.data.amount / 100;
    const channel    = ps.data.channel ?? "paystack";

    // 2. Write payment record using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // The transaction must belong to the member it is being recorded for:
    // the checkout is always opened with the member's login email.
    const { data: payerProfile } = await supabase
      .from("profiles").select("email").eq("user_id", user_id).maybeSingle();
    const paystackEmail = ps.data.customer?.email?.toLowerCase();
    if (!payerProfile?.email || !paystackEmail || paystackEmail !== payerProfile.email.toLowerCase()) {
      return fail("Payment does not belong to this member account");
    }

    // A reference can be redeemed once, across both payment tables.
    const [{ data: refInPayments }, { data: refInDues }] = await Promise.all([
      supabase.from("payments").select("id").eq("reference", reference).limit(1),
      supabase.from("dues_payments").select("id").eq("reference", reference).limit(1),
    ]);
    if (refInPayments?.length || refInDues?.length) {
      return fail("This payment reference has already been used");
    }

    if (entity_type === "dues") {
      // Dues payment: record against dues_payments using the Paystack-verified amount
      if (!entity_id) {
        return fail("Missing entity_id (dues_item_id)");
      }

      // The charged amount must cover what this member actually owes; the
      // figure sent to Paystack came from the browser and can be tampered with.
      const [{ data: duesItemRow }, { data: memberProfile }] = await Promise.all([
        supabase.from("dues_items").select("*").eq("id", entity_id).maybeSingle(),
        supabase.from("profiles").select("year_of_call, rank").eq("user_id", user_id).maybeSingle(),
      ]);
      if (!duesItemRow) return fail("Unknown dues item");
      const expected = expectedDueAmount(duesItemRow, memberProfile?.year_of_call ?? null, (memberProfile as any)?.rank ?? null);
      if (expected > 0 && amountNaira < expected) {
        return fail(`Amount paid (₦${amountNaira.toLocaleString("en-NG")}) is less than the amount due (₦${expected.toLocaleString("en-NG")})`);
      }

      const { error: duesErr } = await supabase.from("dues_payments").upsert({
        user_id,
        dues_item_id: entity_id,
        amount:       amountNaira,
        reference,
        status:       "paid",
        paid_at:      new Date().toISOString(),
      }, { onConflict: "user_id,dues_item_id" });

      if (duesErr) throw new Error(duesErr.message);

      await sendReceiptEmail(supabase, user_id, duesItemRow.title || "Branch Dues", amountNaira, reference);

      return new Response(
        JSON.stringify({ success: true, amount: amountNaira, channel }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Service applications: the fee schedule is fixed server-side.
    let serviceLabel = "Service Application";
    if (entity_id && (entity_type ?? "service_application") === "service_application") {
      const { data: app } = await supabase
        .from("service_applications").select("service_type, user_id").eq("id", entity_id).maybeSingle();
      if (!app) return fail("Unknown application");
      if (app.user_id !== user_id) return fail("Application does not belong to this member");
      const expected = SERVICE_FEES[app.service_type];
      if (expected && amountNaira < expected) {
        return fail(`Amount paid (₦${amountNaira.toLocaleString("en-NG")}) is less than the service fee (₦${expected.toLocaleString("en-NG")})`);
      }
      if (app.service_type) {
        serviceLabel = String(app.service_type).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
    }

    const { error: payErr } = await supabase.from("payments").insert({
      user_id,
      entity_type: entity_type ?? "service_application",
      entity_id:   entity_id  ?? null,
      amount:      amountNaira,
      reference,
      channel,
      status: "success",
    });

    if (payErr) throw new Error(payErr.message);

    // 3. If an entity_id was provided, stamp payment_status on the application
    if (entity_id && entity_type === "service_application") {
      await supabase
        .from("service_applications")
        .update({ payment_status: "paid", payment_reference: reference })
        .eq("id", entity_id);
    }

    await sendReceiptEmail(supabase, user_id, serviceLabel, amountNaira, reference);

    return new Response(
      JSON.stringify({ success: true, amount: amountNaira, channel }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, message: err.message }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
