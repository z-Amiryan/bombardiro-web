// The only copy of the site's external addresses and launch values. See handoff/SPEC.md §7.
export const SITE_URL = 'https://bombardiro.app';
export const APP_STORE_ID = '6813968416';
// PLACEHOLDER: the owner confirms this before launch.
export const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
// Provider token from App Store Connect → Analytics → Acquisition → Campaigns. Empty until the owner has it.
export const APP_STORE_PT = '';
export const APP_PRIVACY_URL = 'https://z-amiryan.github.io/bombardiro/privacy-policy/';
export const SUPPORT_EMAIL = 'bombardiro.dev@gmail.com';
export const INSTAGRAM_URL = 'https://www.instagram.com/playbombardiro/';
export const TIKTOK_URL = 'https://www.tiktok.com/@playbombardiro';
export const LAST_UPDATED = '2026-11-02'; // update on launch day

/** One placement per position on the site, so App Store campaign data shows which link brought an install. */
export type StorePlacement =
  | 'hero'
  | 'final'
  | 'howto'
  | 'words'
  | 'guide'
  | 'about'
  | 'header'
  | 'menu'
  | 'footer'
  | 'qr';

/** The App Store link for one position on the site. Campaign parameters appear once `APP_STORE_PT` is set. */
export function storeUrl(placement: StorePlacement, pt: string = APP_STORE_PT): string {
  if (!pt) return APP_STORE_URL;
  return `${APP_STORE_URL}?pt=${encodeURIComponent(pt)}&ct=site-${placement}&mt=8`;
}

/** Social profiles, in footer order. Instagram is never mentioned on Russian pages (.claude/rules/copy.md). */
export const SOCIAL_LINKS = [
  { name: 'Instagram', url: INSTAGRAM_URL, hiddenOn: ['ru'] },
  { name: 'TikTok', url: TIKTOK_URL, hiddenOn: [] },
] as const satisfies ReadonlyArray<{ name: string; url: string; hiddenOn: ReadonlyArray<'en' | 'ru' | 'hy'> }>;

export function socialLinksFor(lang: 'en' | 'ru' | 'hy') {
  return SOCIAL_LINKS.filter((s) => !(s.hiddenOn as ReadonlyArray<string>).includes(lang));
}

/**
 * Which language's screenshots each site language shows. Armenian pages use the English captures until
 * Armenian ones exist; change `hy` to 'hy' once `assets/screenshots/hy/` is added.
 */
export const SCREENSHOT_LANG = { en: 'en', ru: 'ru', hy: 'en' } as const;
