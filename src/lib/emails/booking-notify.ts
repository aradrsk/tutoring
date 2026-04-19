import "server-only";
import { sendTemplate } from "./send";
import { TZ, type Duration } from "@/lib/availability";

const TEACHER_NAME_DEFAULT = "Theepa Jeyapalan";
const TEACHER_ADDRESS_DEFAULT =
  "Address in this email (teacher's home, Toronto)";
const BOOKING_CONFIRMATION_TEMPLATE_ID =
  process.env.RESEND_TEMPLATE_BOOKING ??
  "406b1842-5f5d-4791-a86e-5a0940d0a512";

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-CA", {
    timeZone: TZ,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeLabel(d: Date): string {
  return `${d.toLocaleTimeString("en-CA", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} (Toronto)`;
}

/** Fire-and-forget booking confirmation email. Logs on failure. */
export function sendBookingConfirmation(args: {
  toEmail: string;
  studentName: string;
  startAt: Date;
  duration: Duration;
  siteUrl: string;
}) {
  const { toEmail, studentName, startAt, duration, siteUrl } = args;
  void sendTemplate({
    to: toEmail,
    templateId: BOOKING_CONFIRMATION_TEMPLATE_ID,
    variables: {
      student_name: studentName,
      teacher_name: process.env.TEACHER_NAME ?? TEACHER_NAME_DEFAULT,
      date_label: formatDateLabel(startAt),
      time_label: formatTimeLabel(startAt),
      duration_minutes: duration,
      address: process.env.TEACHER_ADDRESS ?? TEACHER_ADDRESS_DEFAULT,
      cancel_url: `${siteUrl}/account/bookings`,
      site_url: siteUrl,
    },
  }).then((res) => {
    if (!res.ok)
      console.warn("[email] booking confirmation failed:", res.error);
  });
}
