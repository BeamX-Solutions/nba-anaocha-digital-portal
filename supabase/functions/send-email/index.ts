import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SECRETARIAT_EMAIL = Deno.env.get("SECRETARIAT_EMAIL") || "";
const FROM = "NBA Anaocha Portal <onboarding@resend.dev>";

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  application_approved: ({ name, service_type }) => ({
    subject: `Application Approved — ${service_type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">NBA Anaocha Branch Portal</h2>
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your application for <strong>${service_type}</strong> has been <strong style="color:#1a5c38">approved</strong> by the branch secretariat.</p>
        <p>Please visit the branch office to collect your item. Kindly bring a valid form of identification.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  application_rejected: ({ name, service_type }) => ({
    subject: `Application Update — ${service_type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">NBA Anaocha Branch Portal</h2>
        <p>Dear ${name},</p>
        <p>We regret to inform you that your application for <strong>${service_type}</strong> could not be approved at this time.</p>
        <p>Please contact the branch secretariat for more information or to resubmit your application with the required documents.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_suspended: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Suspended",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">NBA Anaocha Branch Portal</h2>
        <p>Dear ${name},</p>
        <p>Your NBA Anaocha portal account has been <strong style="color:#dc2626">suspended</strong>.</p>
        <p>Please contact the branch secretariat for assistance and to resolve any outstanding matters.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_reinstated: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Reinstated",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">NBA Anaocha Branch Portal</h2>
        <p>Dear ${name},</p>
        <p>Your NBA Anaocha portal account has been <strong style="color:#1a5c38">reinstated</strong>. You can now access all portal features.</p>
        <p>If you have any questions, please contact the branch secretariat.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  document_completed: ({ name, document_type, title, reference_number }) => ({
    subject: `Your Document is Ready — ${document_type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">NBA Anaocha Branch Portal</h2>
        <p>Dear ${name},</p>
        <p>Your document has been reviewed and is now <strong style="color:#1a5c38">ready</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666;width:140px">Document:</td><td style="padding:8px;font-weight:600">${title}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Type:</td><td style="padding:8px">${document_type}</td></tr>
          <tr><td style="padding:8px;color:#666">Reference No.:</td><td style="padding:8px">${reference_number}</td></tr>
        </table>
        <p>Please log in to your portal account to view or download your document.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  contact_message: ({ name, email, message }) => ({
    subject: `New Contact Message from ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#1a5c38">New Contact Message — NBA Anaocha Portal</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:8px;color:#666;width:100px">From:</td><td style="padding:8px;font-weight:600">${name}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Email:</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
        </table>
        <div style="background:#f5f5f5;border-left:4px solid #1a5c38;padding:16px;border-radius:4px;white-space:pre-wrap">${message}</div>
        <p style="margin-top:16px"><a href="mailto:${email}" style="background:#1a5c38;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none">Reply to ${name}</a></p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Portal</p>
      </div>`,
  }),
};

Deno.serve(async (req) => {
  try {
    const { type, to, ...data } = await req.json();

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500 });
    }

    const template = templates[type];
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), { status: 400 });
    }

    const { subject, html } = template(data);

    // For contact messages, send to secretariat; otherwise send to member
    const recipient = type === "contact_message" ? SECRETARIAT_EMAIL : to;

    if (!recipient) {
      return new Response(JSON.stringify({ error: "No recipient email" }), { status: 400 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: recipient, subject, html }),
    });

    const result = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: result }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
