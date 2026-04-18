import "server-only";

const LIME = "#B9FF66";
const INK = "#191A23";

export type BookingConfirmationData = {
  studentName: string;
  teacherName: string;
  dateLabel: string; // "Thursday, April 23"
  timeLabel: string; // "16:00 (Toronto)"
  durationMinutes: number; // 30, 45, 60
  address: string; // "123 Example St, Toronto, ON"
  cancelUrl: string; // "https://tutoring.aradrsk.com/account/bookings"
  siteUrl: string; // "https://tutoring.aradrsk.com"
};

export function renderBookingConfirmation(data: BookingConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Session confirmed — ${data.dateLabel} at ${data.timeLabel}`;

  const html = buildHtml(data);
  const text = buildText(data);

  return { subject, html, text };
}

/* ---------- HTML template ---------- */

function buildHtml(d: BookingConfirmationData): string {
  const e = escapeHtml;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${e(`Session confirmed`)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${e(`Your ${d.durationMinutes}-minute session with ${d.teacherName} is locked in for ${d.dateLabel} at ${d.timeLabel}.`)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:2px solid ${INK};border-radius:24px;overflow:hidden;">

          <!-- Logo -->
          <tr>
            <td style="padding:28px 32px 0 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${INK};width:24px;height:24px;border-radius:4px;"></td>
                  <td style="padding-left:8px;font-size:18px;font-weight:700;color:${INK};">
                    tutor<span style="color:${LIME};">.</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Headline -->
          <tr>
            <td style="padding:24px 32px 8px 32px;">
              <h1 style="margin:0;font-size:32px;line-height:1.15;font-weight:500;color:${INK};">
                Session
                <span style="display:inline-block;background-color:${LIME};padding:0 10px;border-radius:6px;">
                  confirmed
                </span>.
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:12px 32px 0 32px;font-size:16px;line-height:1.55;color:${INK};">
              Hi ${e(d.studentName)}, your booking with <strong>${e(d.teacherName)}</strong> is locked in. Details below.
            </td>
          </tr>

          <!-- Details card -->
          <tr>
            <td style="padding:24px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f8f8;border-radius:16px;padding:4px;">
                ${detailRow("When", `${e(d.dateLabel)} · ${e(d.timeLabel)}`)}
                ${detailRow("Length", `${d.durationMinutes} minutes`)}
                ${detailRow("Where", e(d.address))}
                ${detailRow("Teacher", e(d.teacherName))}
                ${detailRow("Cancel by", "24 hours before start")}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding:28px 32px 4px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${INK};border-radius:16px;">
                    <a href="${e(d.cancelUrl)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:500;color:#ffffff;text-decoration:none;">
                      View in dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Small print -->
          <tr>
            <td style="padding:16px 32px 28px 32px;font-size:13px;line-height:1.5;color:#6b6b6b;text-align:center;">
              Need to cancel? You can do it from your dashboard up to 24 hours before the session starts.
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background-color:#eeeeee;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;font-size:12px;line-height:1.5;color:#8a8a8a;">
              You're receiving this because you booked a session on
              <a href="${e(d.siteUrl)}" style="color:#8a8a8a;">tutor.</a>
              All times in America/Toronto.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #eeeeee;font-size:13px;color:#6b6b6b;width:110px;">${escapeHtml(label)}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #eeeeee;font-size:15px;color:${INK};font-weight:500;">${value}</td>
    </tr>`;
}

/* ---------- Plain-text fallback ---------- */

function buildText(d: BookingConfirmationData): string {
  return [
    `Session confirmed`,
    ``,
    `Hi ${d.studentName},`,
    ``,
    `Your booking with ${d.teacherName} is locked in.`,
    ``,
    `When:    ${d.dateLabel} · ${d.timeLabel}`,
    `Length:  ${d.durationMinutes} minutes`,
    `Where:   ${d.address}`,
    `Cancel:  up to 24 hours before start`,
    ``,
    `Dashboard: ${d.cancelUrl}`,
    ``,
    `— tutor. (${d.siteUrl})`,
    `All times in America/Toronto.`,
  ].join("\n");
}

/* ---------- Helpers ---------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
