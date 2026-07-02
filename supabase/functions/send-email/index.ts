import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SECRETARIAT_EMAIL = Deno.env.get("SECRETARIAT_EMAIL") || "";
const FROM = Deno.env.get("RESEND_FROM") || "NBA Anaocha <noreply@beamxsolutions.com>";
const SITE_URL = Deno.env.get("SITE_URL") || "https://nba-anaocha-digital-portal.vercel.app";

const brandHeader = (color = "#1a5c38") => `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <img src="${SITE_URL}/nba-logo.png" alt="NBA Anaocha" width="44" height="44" style="display:block;border-radius:6px" />
        <h2 style="color:${color};margin:0">NBA Anaocha Branch Portal</h2>
      </div>`;

const templates: Record<string, (data: any) => { subject: string; html: string }> = {
  application_approved: ({ name, service_type }) => ({
    subject: `Application Approved — ${service_type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>We are pleased to inform you that your application for <strong>${service_type}</strong> has been <strong style="color:#1a5c38">approved</strong> by the branch secretariat.</p>
        <p>Please visit the branch office to collect your item. Kindly bring a valid form of identification.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  application_rejected: ({ name, service_type, reason }) => ({
    subject: `Application Update — ${service_type}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>We regret to inform you that your application for <strong>${service_type}</strong> could not be approved at this time.</p>
        ${reason ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0"><p style="margin:0;font-size:13px;color:#991b1b"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        <p>Please contact the branch secretariat for more information or to resubmit your application with the required documents.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_denied: ({ name, reason }) => ({
    subject: "Update on Your NBA Anaocha Portal Registration",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>Thank you for registering on the NBA Anaocha Branch Portal. After review, the branch secretariat was <strong style="color:#dc2626">unable to approve</strong> your registration at this time.</p>
        ${reason ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0"><p style="margin:0;font-size:13px;color:#991b1b"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        <p>If you believe this is an error or you can provide additional verification, please contact the branch secretariat.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  profile_change_approved: ({ name, changes_summary }) => ({
    subject: "Your Profile Changes Have Been Approved",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>The changes you requested to your profile have been <strong style="color:#1a5c38">approved</strong> by the branch secretariat and are now live.</p>
        ${changes_summary ? `<div style="background:#f0fdf4;border-left:4px solid #1a5c38;padding:12px 16px;border-radius:4px;margin:16px 0"><p style="margin:0;font-size:13px;color:#166534">${changes_summary}</p></div>` : ""}
        <p>You can review your updated profile on the portal.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  profile_change_rejected: ({ name, reason }) => ({
    subject: "Update on Your Profile Change Request",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>The changes you requested to your profile could <strong style="color:#dc2626">not be approved</strong> by the branch secretariat. Your profile remains unchanged.</p>
        ${reason ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0"><p style="margin:0;font-size:13px;color:#991b1b"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        <p>You may submit a new request with corrected details, or contact the branch secretariat for assistance.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  payment_receipt: ({ name, description, amount, reference }) => ({
    subject: `Payment Received — ${description}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>Your payment has been received and confirmed. Thank you.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666;width:140px">Payment for:</td><td style="padding:8px;font-weight:600">${description}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Amount:</td><td style="padding:8px;font-weight:600">&#8358;${Number(amount).toLocaleString("en-NG")}</td></tr>
          <tr><td style="padding:8px;color:#666">Reference:</td><td style="padding:8px;font-family:monospace">${reference}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Date:</td><td style="padding:8px">${new Date().toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</td></tr>
        </table>
        <p>You can view your payment history on the portal. Keep this email as your receipt.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  dues_receipt_verified: ({ name, item_title }) => ({
    subject: `Receipt Verified — ${item_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>The receipt you submitted for <strong>${item_title}</strong> has been reviewed and <strong style="color:#1a5c38">verified</strong> by the branch secretariat. You are marked as compliant for this item.</p>
        <p>No further action is needed. Thank you.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  dues_receipt_rejected: ({ name, item_title, reason }) => ({
    subject: `Receipt Not Accepted — ${item_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>The receipt you submitted for <strong>${item_title}</strong> could <strong style="color:#dc2626">not be accepted</strong> by the branch secretariat.</p>
        ${reason ? `<div style="background:#fef2f2;border-left:4px solid #dc2626;padding:12px 16px;border-radius:4px;margin:16px 0"><p style="margin:0;font-size:13px;color:#991b1b"><strong>Reason:</strong> ${reason}</p></div>` : ""}
        <p>Please log in to the portal and upload a corrected receipt, or contact the branch secretariat for assistance.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_deleted: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Removed",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>Your NBA Anaocha portal account and associated data have been <strong style="color:#dc2626">removed</strong> by the branch secretariat.</p>
        <p>If you believe this was done in error, please contact the branch secretariat.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_suspended: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Suspended",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
        <p>Dear ${name},</p>
        <p>Your NBA Anaocha portal account has been <strong style="color:#dc2626">suspended</strong>.</p>
        <p>Please contact the branch secretariat for assistance and to resolve any outstanding matters.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Nnewi, Anambra State, Nigeria</p>
      </div>`,
  }),

  account_approved: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Approved",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader("#1a3a5c")}
        <p>Dear ${name},</p>
        <p>Your NBA Anaocha portal account has been <strong style="color:#1a5c38">approved</strong>. You can now sign in and access all member features.</p>
        <p>Visit the portal to get started.</p>
        <p style="margin-top:32px;color:#666;font-size:13px">NBA Anaocha Branch Secretariat<br/>Anambra State, Nigeria</p>
      </div>`,
  }),

  account_reinstated: ({ name }) => ({
    subject: "Your NBA Anaocha Portal Account Has Been Reinstated",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        ${brandHeader()}
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
        ${brandHeader()}
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
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <img src="${SITE_URL}/nba-logo.png" alt="NBA Anaocha" width="44" height="44" style="display:block;border-radius:6px" />
          <h2 style="color:#1a5c38;margin:0">New Contact Message — NBA Anaocha Portal</h2>
        </div>
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

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const { type, to, ...data } = await req.json();

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500, headers: cors });
    }

    const template = templates[type];
    if (!template) {
      return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), { status: 400, headers: cors });
    }

    const { subject, html } = template(data);

    // For contact messages, send to secretariat; otherwise send to member
    const recipient = type === "contact_message" ? SECRETARIAT_EMAIL : to;

    if (!recipient) {
      return new Response(JSON.stringify({ error: "No recipient email" }), { status: 400, headers: cors });
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
      return new Response(JSON.stringify({ error: result }), { status: 500, headers: cors });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: cors });
  }
});
