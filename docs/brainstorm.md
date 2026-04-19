# Brainstorm — Tutoring app, Positivus edition

A working sketchpad for UX and architecture moves on tutoring.aradrsk.com. Opinionated, site-specific, and scoped to a solo-teacher K-12 English practice in Toronto.

---

## Landing (`/`)

### Replace the "Learn more" dead-ends on ServiceCards
Each session-length card currently shows an arrow and "Learn more" text that goes nowhere. Either link them to anchors that explain what 30 vs 45 vs 60 minutes actually covers pedagogically, or drop the affordance — a dead arrow on a card with a 6px drop shadow reads like broken chrome.

### Make the availability preview bookable in place
The 15-day DayCard grid shows lime pills for open windows but requires a second trip through `/book` to actually reserve one. Wire each pill to `/book?date=YYYY-MM-DD&start=HH:MM` so the wizard opens pre-filled. Removes a full step for returning users who already know the flow.

### Fix the pricing section lie
The card says "$0" and "Free while we're in prototype", but you already shipped Stripe + a free-first-session rule. The copy undermines the very thing the webhook was built for. Swap to a Positivus-style split card: lime side "First session free", ink side "After that: $X / 30min, $Y / 45min, $Z / 60min" with a small "Paid via Stripe, cancel up to 12h before" footnote.

### Trust row under the hero
Theepa is an unknown quantity to a parent scrolling from Instagram. A single row of four lime-pill chips under the CTA — "Certified teacher", "Toronto in-person", "K-12 only", "First session free" — does more work than any paragraph. Cheap to build, high-conversion.

### Replace the abstract hero illustration with a photo or a day-grid
The floating diamond/heart/checkmark SVG is pretty but says nothing about tutoring. A cropped photo of Theepa at a desk, or a stylized mini version of the DayCard grid itself, would ground the hero. Positivus uses abstract shapes because it's a fake agency — real services benefit from real faces.

---

## `/signup`

### Collect "who is this account for" on step 1, not later
Given parent-vs-student is an open question, the first radio on signup should be "I'm a parent booking for my child" / "I'm a student 13+ booking for myself". Everything downstream — COPPA posture, `/get-started` fields, dashboard layout — forks from this answer. Deciding it on the signup screen is cheaper than rewriting `/get-started` twice.

### Pre-verify the email before password
Students mistype gmail addresses constantly. Send a one-time code, require it before letting them set a password. Kills the whole class of "booked a session but never got the confirmation email" tickets before they exist.

### Soft-block under-13 self-signup
With Firebase Auth + a date-of-birth field, detect under-13 and reroute to a "Ask a parent to sign up" screen with a `mailto:` prefill. Cleaner than building a COPPA consent flow you don't need yet.

### Show the free-first-session promise on the signup card itself
Right now the promise lives on landing only. A small lime pill on the signup form ("First session free — no card needed today") reduces drop-off at the highest-friction step.

---

## `/login`

### Magic-link first, password second
Parents forget passwords. A magic link via Resend (which is already wired) is a one-click fix, no reset flow, no support burden. Password becomes the fallback for the teacher and for anyone who wants it.

### Surface the next upcoming booking on the post-login redirect
Instead of dumping returning users at `/account/bookings`, land them on a slim "Welcome back — your next session is Tuesday at 4pm" card with buttons for reschedule and directions. The bookings list is a secondary view.

### Distinct "I'm the teacher" entry
Theepa logs in from the same form as students. A tiny staff link at the bottom ("Teacher? Sign in →") that routes post-auth to `/dashboard/availability` instead of `/account/bookings` saves her two clicks a day, every day.

### Lock out the login card visually until emailVerified
If a user lands here mid-verify, the card should show their email greyed out with a "Check your inbox — resend code" button. Right now an unverified user can submit credentials and bounce off a server error.

---

## `/get-started`

### Split into two sub-flows keyed off the signup radio
Parent flow asks: parent name, phone, child's name, child's grade, learning goals, any IEP/accommodations. Student flow asks: name, grade, what they want help with. Running both through the same form creates weird fields like "Student's parent's phone" that nobody fills correctly.

### Ask for grade as a single chip row, not a dropdown
"K, 1, 2, 3… 12" as lime pills. Faster on mobile, matches the design system, and makes grade-based service suggestions ("For grade 4, most parents book 30 minutes") trivial to render.

### Capture the Instagram handle or referral source
You mentioned "Instagram bio to confirmed booking" on landing. A tiny "How'd you find us? (optional)" chip picker at the end of the profile form is the only way you'll know if IG is actually working. Zero friction, high signal.

### Autosave as the user types
Profile forms get abandoned. Every field blur writes to a `profile_drafts` row keyed on userId. If they bounce and come back via magic link, prefill everything. Drizzle upsert makes this a four-line server action.

---

## `/book`

### Lock in the date before asking for length
Currently the wizard is length → date → time. Flip it to date → time → length. Reason: families have a fixed schedule, not a fixed session length. "I'm free Tuesday at 4 — what fits?" is how they actually think. Length becomes a downgrade (shorter slot if 60 doesn't fit) rather than a constraint.

### Show price at the time-picker step, not at checkout
Once the first-free-session rule has been consumed, the booking wizard should show "$X charged after you confirm" inline next to the time pill. Surprise Stripe screens are the biggest cancellation driver for paid tutoring.

### Explicit "who is this for" selector when a parent has multiple children
Ties directly into the parent-vs-student model below. If the parent account has two children, the first screen is two chunky cards: "Book for Maya (Grade 5)" / "Book for Arjun (Grade 9)". Removes the "wait, which kid did I book for" confusion.

### Offer a recurring booking toggle on the last step
"Book this slot every week for 4 weeks." For a solo teacher, recurring bookings are 80% of revenue and currently require four separate wizard runs. Store as a `recurrence_rule` column, expand to individual `bookings` rows on confirm so cancellation stays per-session.

### Handle the 12h cancellation window visibly in the confirmation
Last wizard step should say "Free to cancel until Monday 4am (12h before)" with an actual computed timestamp, not generic policy text. Parents respond to dates, not rules.

---

## `/book/success`

### Add-to-calendar as the primary action
The only thing a parent wants on this screen is the calendar file. A big lime "Add to Google / Apple / Outlook" button, drop-shadowed, above the fold. The confirmation email is the backup, not the primary delivery.

### Show the teacher's address with a Google Maps deeplink
If the session is within 24 hours, show the address inline. Otherwise, show "Address will appear here 24h before your session" — keeps the address out of forwarded emails and screenshots.

### "What to bring" checklist specific to the session length
30 min: pencil, whatever homework. 60 min: pencil, current novel, last graded essay. Three bullets, one-line each. Kills pre-session DMs.

### Cross-sell the next session only after the first one happens
Do NOT put a "Book another" CTA on `/book/success` for first-time bookings. The parent hasn't seen the teacher yet. Instead, trigger that CTA from the post-session email 30 minutes after the end timestamp.

---

## `/account/bookings`

### Separate "Upcoming" and "History" as tabs, not a merged list
Upcoming is actionable (reschedule, cancel, add to calendar). History is reference (receipts, rebook-same-slot). Mashing them together forces cognitive scanning. Tabs are a Positivus-native pattern — two lime pills above the card grid.

### Each booking card shows the cancellation deadline as a countdown
"Cancellable for 2d 14h" as a small ink chip on the upcoming card. Once the 12h window closes, the chip turns red and says "Locked — contact Theepa". Makes the policy self-enforcing.

### Inline reschedule, not a modal
Click "Reschedule" → the booking card expands in place into a mini time-picker showing the same week's available windows. A modal breaks the Positivus card-stacking aesthetic and adds a click.

### Show a "lessons with this student" counter for the parent dashboard
"Maya has had 6 sessions with Theepa. Next: Tuesday 4pm." One-line fact, builds the sense of continuity, and sets up lesson-notes as a premium upsell later.

### Empty state with a booked slot shortcut
If no upcoming bookings, the empty state shows the next three open windows from `/` availability and a "Book this" pill on each. Zero-click path from dashboard to booked session.

---

## `/dashboard/availability` (teacher-only)

### Week-at-a-glance toggle
Right now (presumably) the teacher sets rules per-weekday. Add a "This week" view that renders the next 7 days with actual bookings overlaid on availability rules. She needs to see "am I double-booked on Thursday" more than she needs to edit rules.

### One-click "block today" button
Sick days happen. A single ink button at the top: "Block rest of today" — creates an `availability_blocks` row for today and emails anyone with a pending booking. No multi-step date picker.

### Earnings chip at the top
Lime pill: "This week: $180 · 6 sessions". Uses Stripe data that already exists. A solo tutor checks revenue more than they check availability rules.

### Draft mode for availability changes
Edits to weekly rules should stage into a "publish changes" state before going live on `/`. Otherwise the teacher accidentally publishes a half-edited schedule at 11pm and students book broken slots.

### Student-of-the-week quick note
A textarea per student that shows on the parent's next booking confirmation email. "Great work on topic sentences this week — try the three-paragraph practice!" Teacher writes it after the session, parent sees it before the next one. Retention feature disguised as a note field.

---

## `/updates`

### Pin the latest update at the top with a lime "New" pill
A changelog page that isn't clearly sorted dies. First entry gets the lime pill treatment from the design system, everything else is ink-on-white.

### Tag updates by audience
Three chips on each entry: "Parents", "Students", "Teacher". A parent doesn't care about availability-rule UI changes. Filtering by chip at the top of the page is a two-line tailwind change.

### RSS or email subscribe
The people who care about product updates on a tutoring site are (a) the teacher, (b) power-parents. A "Get updates by email" form at the bottom, backed by Resend broadcasts, converts `/updates` from vanity into a retention tool.

---

## `/privacy` and `/terms`

### Summary-first layout
Both pages should open with a lime-bordered card: "The short version — we collect X, we don't sell Y, you can delete your account at Z." Full legal text follows. Nobody reads terms, but a summary card earns trust and is cheap.

### Last-updated timestamp in the nav of these pages
Dynamic from file mtime or a manual constant. Legal pages without dates look fake. One line of copy.

### Child-data call-out on `/privacy`
Given K-12, a dedicated section titled "Kids under 13" is required, and should be linked from the signup form. Explicitly state that parent accounts are the canonical holder of child data and that you don't store biometric, health, or school-record info.

---

## `/not-found`

### Suggest the three most likely intended destinations
`/book`, `/account/bookings`, and `/` — rendered as the same lime-pilled cards from the services section. A 404 with no suggestions is a dead end; with suggestions, it's a recovery funnel.

### Playful illustration that matches the hero
Reuse the abstract diamond-and-sparkle vocabulary from `HeroIllustration`. Shows design consistency and makes the 404 feel like part of the product, not a framework default.

### Link to `/updates` in case the route was renamed
If you ever rename `/account/bookings` to `/my-sessions` or similar, old bookmarks will 404. A quick "Did we move something? Check the updates page." saves support mail.

---

## Parent vs. student architecture

### Option A — Parent-only login, students are records
Parent signs up, then in `/get-started` adds one or more child records (name, grade, goals). Only the parent ever logs in. Booking wizard has a "Who is this for?" step when more than one child exists. Dashboard shows all children's bookings grouped by child.

**Data model**: `users` table is parent-only. New `students` table with `parent_user_id` FK, no auth fields. `bookings.student_id` FK, `bookings.booked_by_user_id` FK. Invites: none — the parent owns everything.

**Pros**: Simplest to build, matches K-12 reality (parents pay), no COPPA headache, cancellation emails go to one inbox.
**Cons**: A 14-year-old who wants to reschedule their own session can't. The parent is a bottleneck.

### Option B — Both parent and student log in, linked accounts
Parent signs up first, then invites the student via email. Student creates their own Firebase Auth account, which is shadow-linked to the parent. Parent sees everything, student sees only their own sessions and can book within parent-approved time budgets.

**Data model**: `users` has a `role` enum (`parent`, `student`, `teacher`). New `family_links` table with `parent_user_id`, `student_user_id`, `status` (`pending`, `active`, `revoked`). `bookings.student_user_id` directly. Invites: Resend email with a signed token → student signup pre-fills `family_links` row.

**Pros**: Scales into teen autonomy without a rewrite. Teacher can message students directly when pedagogically appropriate. Student dashboard has its own shape (homework checklist, lesson notes) that doesn't belong on a parent dashboard.
**Cons**: COPPA exposure for under-13 student accounts. Two inboxes means two places cancellation emails might be missed. Invite flow is a new failure mode.

### Option C — Parent-primary with optional student "view-only" magic link (recommended)
Parent signs up, adds child records (Option A's data model). The parent dashboard has a per-child toggle: "Let Maya see her own schedule". Enabling it generates a permanent magic-link URL (`/s/<token>`) that the child can bookmark. Clicking the link sets a long-lived cookie and renders a read-only student view — sessions, lesson notes, what to bring — with no booking, no cancel, no payment access.

**Data model**: Option A's `students` table plus a `student_view_tokens` table (`student_id`, `token`, `revoked_at`). No Firebase Auth account for the child. Parent can revoke the token from the dashboard at any time.

**Pros**: Zero COPPA surface (no child account, no child PII collected beyond what parent already entered). Students feel ownership without the teacher or you babysitting credentials. Parent retains control of booking and billing. Four hours of implementation vs. forty.
**Cons**: Link-sharing risk if the child forwards the URL. Mitigated by revocation + "sessions-only, no personal data" view. No bi-directional messaging — but you don't want that in v1 anyway.

**Recommendation**: Ship Option C. It earns you 90% of Option B's UX for 10% of the complexity and keeps the solo-teacher support burden at one inbox. Revisit in six months when teen users start asking to book themselves.

---

## New pages worth considering

### `/teacher/theepa`
A dedicated teacher profile page with a longer bio, teaching philosophy, certifications, sample lesson plan, and three parent testimonials. Matters because "Your teacher" section on landing is a sizzle reel, and parents paying real money want a steak. Link to it from every mention of Theepa's name.

### `/faq`
Answers to "where exactly do sessions happen", "what if my kid is sick", "do you tutor for the SSAT", "can siblings share a 60-minute slot". Matters because every one of these questions currently arrives as a DM, and DMs don't scale with a solo teacher.

### `/account/notes`
Per-session lesson notes written by Theepa after each session, scoped to the student (or the parent viewing on the student's behalf). Matters because it's the single feature that justifies a parent paying month-after-month over a cheaper Kijiji tutor.

### `/account/billing`
Stripe customer portal embed — invoices, payment method, cancel auto-pay. Matters because the moment paid sessions turn on, parents will ask "where's my receipt" every week. One page, one Stripe redirect, done.

### `/refer`
Share a code that gives another family their first session free and credits the referrer a free session too. Matters because Theepa's growth engine is word-of-mouth in Toronto parent circles, and the product should make that easy instead of relying on DMs and Instagram stories.

---

## Anti-patterns to avoid

### Don't build a chat feature between teacher and student
A solo K-12 teacher on a small platform has no business running DMs with minors, and the legal exposure is real. Email + SMS via Theepa's existing channels is the right abstraction. If you need in-product messaging, bound it to "parent ↔ teacher only".

### Don't gamify lesson completion with badges or streaks
The audience is 8-year-olds to 17-year-olds plus their parents. A streak counter turns into anxiety the first time a family goes on vacation, and badges read as childish to teens. Positivus's brutalist-cheerful aesthetic is enough warmth on its own.

### Don't introduce a third accent color
Lime + ink + white is the whole system. The moment you add orange for "warning" or blue for "info", the identity dissolves. Use red-300 sparingly for blocked states (it's already in the DayCard) and otherwise stick to the existing two.

### Don't build group classes or marketplaces
The product's whole edge is 1:1 in-person with a named teacher in Toronto. A group-class feature dilutes that into a generic EdTech app and puts Theepa in competition with Outschool and Varsity Tutors, where she loses on scale. Say no twice.

### Don't auto-rebook or surprise-charge
Recurring bookings should require explicit re-confirmation each month, and no charge should ever happen more than 24 hours before a session. Parents paying for kid services are hair-trigger about surprise charges — one Reddit post kills a solo teacher's reputation in a mid-size city faster than any UX win can repair.
