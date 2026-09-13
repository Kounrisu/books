// A single shared account that every anonymous "Try the demo" visitor logs
// into — findOrCreate'd by this email, never registered through the normal
// signup form. DemoResetService periodically wipes and reseeds its data.
export const DEMO_USER_EMAIL = 'demo@books.sn8w.com';

// Anti-abuse: the demo account is shared by everyone currently trying the
// app, so creation is capped rather than left unbounded.
export const DEMO_MAX_BOOKS = 200;

export const DEMO_RESET_INTERVAL_MS = 60 * 60 * 1000;
