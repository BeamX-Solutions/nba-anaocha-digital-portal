import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { formData, precedentText, method, documentType } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let prompt = "";

    if (method === "ai") {
      const docLabel = (documentType as string || "legal document")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase());

      const fieldLines = Object.entries(formData as Record<string, string>)
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `- ${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
        .join("\n");

      prompt = `You are a Nigerian legal document drafting assistant. Generate a professional ${docLabel} based on the following details. The document must comply with the Legal Practitioners' Remuneration Order 2023.

Details:
${fieldLines}

Generate a complete, professional ${docLabel} with all standard clauses including recitals, operative provisions, covenants, and attestation clauses. Use formal legal language appropriate for Nigerian conveyancing practice. Include proper signature blocks and attestation clauses at the end.`;
    } else {
      prompt = `You are a Nigerian legal document specialist. Take the following precedent document and reformat it to comply with the Legal Practitioners' Remuneration Order 2023. Ensure proper legal formatting, add any missing standard clauses, and ensure compliance.

Precedent Document:
${precedentText}

Output the reformatted, compliant document.`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    return new Response(JSON.stringify({ content }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
