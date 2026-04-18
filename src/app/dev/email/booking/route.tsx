import { renderBookingConfirmation } from "@/lib/emails/booking-confirmation";

// Preview route — renders the booking confirmation email with sample data so
// you can eyeball layout changes without firing a real send. Safe to keep
// public: no session data, no secrets.
export async function GET() {
  const { html } = renderBookingConfirmation({
    studentName: "Alex",
    teacherName: "Theepa Jeyapalan",
    dateLabel: "Thursday, April 23",
    timeLabel: "16:00 (Toronto)",
    durationMinutes: 60,
    address: "123 Example St, Toronto, ON M4C 1B5",
    cancelUrl: "https://tutoring.aradrsk.com/account/bookings",
    siteUrl: "https://tutoring.aradrsk.com",
  });

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
