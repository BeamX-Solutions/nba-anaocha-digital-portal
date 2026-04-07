import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "NBA Anaocha <noreply@beamxsolutions.com>";

const headerHtml = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1a3a5c;padding:32px 40px;text-align:center;">
    <tr>
      <td>
        <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.6);font-weight:600;">Nigerian Bar Association</p>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">NBA Anaocha Branch</h1>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.5);">Digital Portal</p>
      </td>
    </tr>
  </table>
`;

const footerHtml = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f8f9;border-top:1px solid #e8e8e8;padding:20px 40px;text-align:center;">
    <tr>
      <td>
        <p style="margin:0;font-size:12px;color:#aaa;">&copy; ${new Date().getFullYear()} NBA Anaocha Branch &bull; Anambra State, Nigeria</p>
        <p style="margin:6px 0 0;font-size:12px;color:#aaa;"><a href="mailto:support@nbaanaocha.org.ng" style="color:#1a3a5c;text-decoration:none;">support@nbaanaocha.org.ng</a></p>
      </td>
    </tr>
  </table>
`;

function wrapEmail(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
          <tr><td>${headerHtml}</td></tr>
          <tr><td style="padding:40px 40px 32px;">${body}</td></tr>
          <tr><td>${footerHtml}</td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function buttonHtml(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
    <a href="${href}" style="display:inline-block;background-color:#1a3a5c;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:6px;">${label}</a>
  </td></tr></table>`;
}

const emailTemplates: Record<string, (url: string) => { subject: string; html: string }> = {
  signup: (url) => ({
    subject: "Confirm your NBA Anaocha account",
    html: wrapEmail(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">Confirm Your Email Address</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">Thank you for registering on the NBA Anaocha Digital Portal. Please confirm your email address to complete your registration.</p>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">Click the button below to verify your email. This link expires in 24 hours.</p>
      ${buttonHtml(url, "Confirm Email Address")}
      <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.6;">If you did not create an account, you can safely ignore this email.</p>
    `),
  }),

  recovery: (url) => ({
    subject: "Reset your NBA Anaocha password",
    html: wrapEmail(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">Reset Your Password</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">We received a request to reset the password for your NBA Anaocha Digital Portal account.</p>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">Click the button below to choose a new password. This link expires in 1 hour.</p>
      ${buttonHtml(url, "Reset Password")}
      <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.6;">If you did not request a password reset, please ignore this email. Your password will not change.</p>
    `),
  }),

  email_change: (url) => ({
    subject: "Confirm your new email address",
    html: wrapEmail(`
      <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a2e;">Confirm Your New Email Address</h2>
      <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">A request was made to change the email address associated with your NBA Anaocha Digital Portal account.</p>
      <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.6;">Click the button below to confirm this change. This link expires in 24 hours.</p>
      ${buttonHtml(url, "Confirm Email Change")}
      <p style="margin:28px 0 0;font-size:13px;color:#888;line-height:1.6;">If you did not request this change, please contact us immediately at <a href="mailto:support@nbaanaocha.org.ng" style="color:#1a3a5c;">support@nbaanaocha.org.ng</a>.</p>
    `),
  }),
};

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const { user, email_data } = payload;

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not set" }), { status: 500 });
    }

    const { token_hash, redirect_to, email_action_type, site_url } = email_data;

    // Build the Supabase verification URL
    const confirmationUrl = `${site_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

    const template = emailTemplates[email_action_type];
    if (!template) {
      // Unknown type — return 200 so Supabase doesn't block auth
      return new Response(JSON.stringify({ message: "Unhandled email type" }), { status: 200 });
    }

    const { subject, html } = template(confirmationUrl);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: user.email,
        subject,
        html,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: result }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Hook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
