import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      return new Response(JSON.stringify({ success: false, message: "Payment not verified by Paystack" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const amountNaira = ps.data.amount / 100;
    const channel    = ps.data.channel ?? "paystack";

    // 2. Write payment record using service role (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (entity_type === "dues") {
      // Dues payment: record against dues_payments using the Paystack-verified amount
      if (!entity_id) {
        return new Response(JSON.stringify({ success: false, message: "Missing entity_id (dues_item_id)" }), {
          status: 400, headers: { ...cors, "Content-Type": "application/json" },
        });
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

      const { data: duesItem } = await supabase
        .from("dues_items").select("title").eq("id", entity_id).maybeSingle();
      await sendReceiptEmail(supabase, user_id, duesItem?.title || "Branch Dues", amountNaira, reference);

      return new Response(
        JSON.stringify({ success: true, amount: amountNaira, channel }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      );
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
    let serviceLabel = "Service Application";
    if (entity_id && entity_type === "service_application") {
      await supabase
        .from("service_applications")
        .update({ payment_status: "paid", payment_reference: reference })
        .eq("id", entity_id);
      const { data: app } = await supabase
        .from("service_applications").select("service_type").eq("id", entity_id).maybeSingle();
      if (app?.service_type) {
        serviceLabel = String(app.service_type).replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
      }
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
