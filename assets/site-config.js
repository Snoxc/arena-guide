/* OCCIUM / Alexandr guide settings. This is a public client-side configuration.
   Never put passwords, API keys, card numbers or private tokens in this file. */
window.GUIDE_PUBLIC_CONFIG = Object.freeze({
  holidaySeason: true,             // Set false to remove festive decorations
  support: {
    goalRub: 15000,                // Proposed public monthly goal — edit freely
    raisedRub: 0,                  // Update only with your real confirmed amount
    paymentUrl: '',                // Optional HTTPS payment/donation page, when ready
    contactUrl: 'https://t.me/occium_bot'
  },
  auth: {
    loginUrl: ''                   // Future real HTTPS authorization URL; no fake login
  }
});
