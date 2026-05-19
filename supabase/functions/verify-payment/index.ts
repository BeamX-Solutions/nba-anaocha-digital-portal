import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
