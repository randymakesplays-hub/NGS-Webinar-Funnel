# NGS Black Friday Webinar Funnel

Registration page for the one-night Kingxeuro live + the Brand Scale Black Friday
window. Built from the NGS BFCM design canvas — desktop, mobile and the
registration funnel in one responsive page.

Static HTML/CSS/JS. No build step, no dependencies, no framework. Deploy the
folder as-is to Vercel, Netlify, Cloudflare Pages or any static host.

```
index.html          the registration page
thank-you.html      post-registration: calendar adds + what to bring
assets/js/config.js EVERY value that changes before launch — start here
assets/js/main.js   countdown, seats, VSL, accordions, modal, tracking
assets/css/styles.css
```

## Before this can go live

Everything below is a real gap, not a default to ship. All of it lives in
`assets/js/config.js` unless noted.

| What | Where |
| --- | --- |
| Webinar date + time (one fixed instant) | `webinarAt` |
| Webinar platform + join link | `joinUrl` |
| Registration backend (POST endpoint) | `registerEndpoint` |
| VSL file (6:14, captions burned in) + poster still | `vslSrc`, `vslPoster` |
| Kingxeuro origin story, 2–3 sentences | `index.html` — Host section |
| Kingxeuro portrait, 4:5 | `index.html` — `.host__photo` |
| 3 client testimonial MP4s (already on the NGS CDN) | `index.html` — `data-src` on `[data-testimonial]` |
| Module count + total runtime for the training vault | `index.html` — module 01 |
| Vendor count for the list | `index.html` — module 02 |
| The bonus in slot 06 | `index.html` — module 06 |
| Refund policy | `index.html` — FAQ 6 |

The countdown renders "[PLACEHOLDER: webinar date…]" and the VSL keeps its
placeholder block until those values are set — nothing fakes a date or a video.

## Tracking

Meta Pixel `1389611089805154`, loaded from config.

| Event | Fires on |
| --- | --- |
| `PageView` | Load |
| `ViewContent` | VSL unmuted |
| `CompleteRegistration` | Registration submitted |

**Do not fire `Lead` from this funnel.** The main site fires `Lead` at $4,000 on
the retainer Typeform; a free webinar signup carrying that value wrecks the
retainer campaigns' optimisation data. Optimise BFCM campaigns for
`CompleteRegistration`.

`LiveAttend` (joins the room) and `Purchase` (Brand Scale checkout) fire from the
webinar platform and the checkout, not from this page.

## Registration form

Six questions carried over verbatim from the live retainer Typeform
(`Z5g3lg6U`) so both lists segment on the same values, plus the optional
attribution question:

name · email · phone · Instagram URL · monthly revenue band · running paid ads ·
how did you hear about NGS (optional)

Dropped for a free registration: "biggest challenge" (long text kills signup
rate), "over $50,000 in online sales" and "monthly budget for agency services" —
those two qualify for a retainer, and Brand Scale exists for founders who answer
them no.

**SMS consent** is a separate, unticked checkbox with the STOP/HELP language,
required before the phone number is used for reminders. The live retainer form
collects a phone number with no consent step while the site's own SMS Terms say
consent is required and separate — this funnel sends reminder texts, so it asks
properly.

The submitted payload includes UTM parameters from the landing URL.

## Page mechanics carried from the build spec

- One page, one action: every CTA opens the same modal. No nav links away.
- The countdown band holds the countdown alone, centred — no seat meter, no
  "X of 500 claimed" anywhere. The Brand Scale price card is gone too; the
  price is announced live and nothing on the page quotes it.
- Brand strip: label on its own line above a hairline, names spread underneath.
- Sticky CTA bar on mobile once the hero scrolls out; desktop keeps the nav button.
- Countdown runs to one fixed instant, rendered in the visitor's local time zone
  (compact format under 640px).
- VSL: autoplay muted with a full-frame unmute overlay, no scrubber, thin
  progress bar, pauses when scrolled away, resumes and remembers position in
  `sessionStorage`, and nudges the CTA once at 60% watched.
- Proof counters animate on scroll; all motion respects `prefers-reduced-motion`.

## Local preview

```sh
python3 -m http.server 8000
# http://localhost:8000
```
