/*
 * NGS Black Friday webinar funnel — single source of truth for everything
 * that changes between now and launch. Nothing else in the codebase should
 * hardcode a date, a price, a seat count or an endpoint.
 *
 * Every value marked PLACEHOLDER is a real gap, not a default to ship.
 */
window.NGS_CONFIG = {
  /* ---- The live ------------------------------------------------------- */
  // PLACEHOLDER: real webinar date/time. One fixed instant, with offset.
  // The page renders it in each visitor's own time zone.
  webinarAt: '2026-11-24T20:00:00-05:00',

  // PLACEHOLDER: webinar platform. Drives the join link and the reminders.
  joinUrl: '',

  /* ---- Scarcity ------------------------------------------------------- */
  totalSeats: 500,

  // Fallback used only until seatsEndpoint is wired. Never increment this
  // per visitor — one fake number poisons every real number on the page.
  seatsClaimed: 347,

  // Optional GET endpoint returning { "claimed": <number> } from the
  // registration backend. Empty string = use seatsClaimed above.
  seatsEndpoint: '',

  /* ---- Registration --------------------------------------------------- */
  // POST endpoint for the registration modal (JSON body).
  // Empty string = the form validates, stores locally and forwards to the
  // thank-you page without sending anywhere. Wire this before launch.
  registerEndpoint: '',
  thankYouUrl: 'thank-you.html',

  /* ---- Video ---------------------------------------------------------- */
  // PLACEHOLDER: VSL file (6:14, captions burned in) and poster still.
  vslSrc: '',
  vslPoster: '',

  /* ---- Pricing (revealed live, shown struck on the page) --------------- */
  bfcmPrice: '[BFCM PRICE]',      // PLACEHOLDER
  regularPrice: '[REGULAR PRICE]', // PLACEHOLDER

  /* ---- Tracking ------------------------------------------------------- */
  // Existing NGS pixel. NOTE: the main site fires `Lead` at $4,000 on the
  // retainer Typeform. This funnel must NOT reuse `Lead` — a free signup
  // valued at $4,000 wrecks the retainer campaigns' optimisation data.
  // Optimise BFCM campaigns for CompleteRegistration instead.
  metaPixelId: '1389611089805154',
  loadPixel: true
};
