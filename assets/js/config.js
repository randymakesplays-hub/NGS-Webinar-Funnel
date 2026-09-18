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
  // Used in copy only ("500 seats"). The live seat meter was removed from the
  // page, so nothing here is fetched or counted.
  totalSeats: 500,

  /* ---- Registration --------------------------------------------------- */
  // GoHighLevel Inbound Webhook URL.
  // In GHL: Automation > Workflows > new workflow > Add Trigger >
  // "Inbound Webhook" > copy the URL it shows > paste it here. Submit the
  // form once so GHL captures a sample payload, then map the fields in the
  // workflow (Create/Update Contact) and add the confirmation email + SMS.
  //
  // Keys this page sends:
  //   full_name, first_name, last_name, email, phone (E.164)
  //   instagram_url, monthly_revenue, running_paid_ads, heard_about_ngs
  //   sms_consent, sms_consent_text, sms_consent_at
  //   registration_source, webinar_at, page_url, submitted_at
  //   utm_source, utm_medium, utm_campaign, utm_content, utm_term
  //
  // Only send the reminder texts to contacts where sms_consent is true, and
  // keep sms_consent_text / sms_consent_at on the contact as the record.
  //
  // Empty string = the form validates and forwards to the thank-you page
  // without sending anywhere.
  registerEndpoint: '',
  thankYouUrl: 'thank-you.html',

  /* ---- Video ---------------------------------------------------------- */
  // PLACEHOLDER: VSL file (6:14, captions burned in) and poster still.
  vslSrc: '',
  vslPoster: '',

  /* ---- Tracking ------------------------------------------------------- */
  // Existing NGS pixel. NOTE: the main site fires `Lead` at $4,000 on the
  // retainer Typeform. This funnel must NOT reuse `Lead` — a free signup
  // valued at $4,000 wrecks the retainer campaigns' optimisation data.
  // Optimise BFCM campaigns for CompleteRegistration instead.
  metaPixelId: '1389611089805154',
  loadPixel: true
};
