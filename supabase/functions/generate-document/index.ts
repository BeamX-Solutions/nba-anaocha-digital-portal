import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  try {
    const { formData, precedentText, method } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let prompt = "";

    if (method === "ai") {
      prompt = `You are a Nigerian legal document drafting assistant. Generate a professional Deed of Assignment document based on the following details. The document must comply with the Legal Practitioners' Remuneration Order 2023.

Details:
- Donor/Assignor/Vendor: ${formData.donor_name} of ${formData.donor_address}
- Donee/Assignee/Purchaser: ${formData.donee_name} of ${formData.donee_address}
- Land Address: ${formData.land_address}
- Consideration: ₦${formData.consideration}
${formData.survey_plan_no ? `- Survey Plan No: ${formData.survey_plan_no}` : ""}
${formData.beacon_nos ? `- Beacon Nos: ${formData.beacon_nos}` : ""}

Generate a complete, professional Deed of Assignment with all standard clauses including recitals, operative provisions, covenants, and attestation clauses. Use formal legal language.`;
    } else {
      prompt = `You are a Nigerian legal document specialist. Take the following precedent document and reformat it to comply with the Legal Practitioners' Remuneration Order 2023. Ensure proper legal formatting, add any missing standard clauses, and ensure compliance.

Precedent Document:
${precedentText}

Output the reformatted, compliant document.`;
    }

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
