// Claims, names and wording that must never appear (.claude/rules/copy.md and legal.md). One list, used by
// check-copy on content/copy/ and by check-site on every built page, including the guides.
export const BANNED = [
  // Trademarks and unrelated names.
  /\bfifa\b/i, /\buefa\b/i, /фифа/i, /уефа/i, /ֆիֆա/i, /ուեֆա/i, /world cup 2026/i, /чм[- ]?2026/i,
  /crocodilo/i, /brainrot/i, /heads up/i, /\btaboo\b/i, /catchphrase/i, /codenames/i,
  // Unprovable superlatives.
  /#1\b/, /\bultimate\b/i, /\bbest\b(?!-known)/i,
  // Official status, licensing, endorsement or partnership.
  /\bofficial(ly)?\b/i, /официальн/i, /պաշտոնական/i, /\blicen[cs]ed\b/i, /\bendorsed\b/i, /\bpartnership\b/i,
  // Features the app doesn't have.
  /\bswipe/i, /team colou?rs/i, /online multiplayer/i, /play remotely/i, /add your own words/i, /custom decks/i,
  /fix any call/i, /edit any round/i, /browser version/i,
  // Word counts the app doesn't have.
  /thousands of words/i, /тысячи слов/i, /10,000\+/,
  // Audience and monetisation claims.
  /for kids/i, /для детей/i, /երեխաների համար/i, /ad-free/i,
  // The app is published.
  /coming soon/i, /launching soon/i, /\bwaitlist\b/i, /скоро (выйдет|запуск)/i,
  // App Store wording (legal.md).
  /at the app store/i, /apple app store/i, /\bdownloadable\b/i,
];

/**
 * Denials that name a banned word ("isn't affiliated with or endorsed by"). Only the denial is allowed, never the
 * bare word, so "endorsed by" as a claim is still caught, in the copy files and on every page.
 */
export const DENIALS = [/\bisn['’]t affiliated with,? (?:or )?endorsed by\b/gi];

/** The first banned phrase in `text` once the allowed denials are taken out, or null. */
export function findBanned(text) {
  const rest = DENIALS.reduce((t, re) => t.replace(re, ' '), text);
  for (const re of BANNED) {
    const m = re.exec(rest);
    if (m) return m[0];
  }
  return null;
}
