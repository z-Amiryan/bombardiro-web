// Claims, names and wording that must never appear (.claude/rules/copy.md and legal.md). One list, used by
// check-copy on content/copy/ and by check-site on every built page, including the guides.
export const BANNED = [
  // Trademarks and unrelated names.
  /\bfifa\b/i, /\buefa\b/i, /фифа/i, /уефа/i, /ֆիֆա/i, /ուեֆա/i, /world cup 2026/i, /чм[- ]?2026/i,
  /crocodilo/i, /brainrot/i, /heads up/i, /\btaboo\b/i, /catchphrase/i, /codenames/i,
  // Unprovable superlatives.
  /#1\b/, /\bultimate\b/i, /\bbest\b(?!-known)/i,
  // Official status, licensing, endorsement or partnership.
  /\bofficial(ly)?\b/i, /официальн/i, /պաշտոնական/, /\blicen[cs]ed\b/i, /\bendorsed\b/i, /\bpartnership\b/i,
  // Features the app doesn't have.
  /\bswipe/i, /team colou?rs/i, /online multiplayer/i, /play remotely/i, /add your own words/i, /custom decks/i,
  /fix any call/i, /edit any round/i, /browser version/i,
  // Word counts the app doesn't have.
  /thousands of words/i, /тысячи слов/i, /10,000\+/,
  // Audience and monetisation claims.
  /for kids/i, /для детей/i, /երեխաների համար/, /ad-free/i,
  // The app is published.
  /coming soon/i, /launching soon/i, /\bwaitlist\b/i, /скоро (выйдет|запуск)/i,
  // App Store wording (legal.md).
  /at the app store/i, /apple app store/i, /\bdownloadable\b/i,
];

/**
 * Copy that may use one banned word because it denies the claim, keyed by copy path: the English independence
 * lines say "isn't … endorsed by". Every other pattern, and every other check, still applies to these strings.
 */
export const ALLOWED = {
  'footer.independent': [/\bendorsed\b/i],
  'pages.about.independent.text': [/\bendorsed\b/i],
};

/** The first banned phrase in `text`, skipping the patterns `allowed` lists, or null. */
export function findBanned(text, allowed = []) {
  for (const re of BANNED) {
    if (allowed.some((a) => a.source === re.source)) continue;
    const m = re.exec(text);
    if (m) return m[0];
  }
  return null;
}
