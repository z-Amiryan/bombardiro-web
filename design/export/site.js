// Shared runtime for the Bombardiro prototype pages.
// Production equivalent: Astro routing from handoff/routes.json + src/config/site.ts.
(function () {
  var PAGES = {
    home: 'Home.dc.html', howToPlay: 'HowToPlay.dc.html', words: 'Words.dc.html', guides: 'Guides.dc.html',
    guide: 'Guide.dc.html', support: 'Support.dc.html', about: 'About.dc.html', privacy: 'Privacy.dc.html',
    notFound: 'NotFound.dc.html'
  };
  var qs = new URLSearchParams(location.search);
  var lang = qs.get('lang');
  if (['en', 'ru', 'hy'].indexOf(lang) < 0) lang = 'en';
  var cache = {};
  function getJSON(path) {
    if (!cache[path]) cache[path] = fetch(path).then(function (r) { return r.json(); });
    return cache[path];
  }
  var FONTS = {
    en: { fd: "'Archivo', sans-serif", fds: 'italic', fu: "'Space Grotesk', sans-serif", k: 1 },
    ru: { fd: "'Noto Sans', sans-serif", fds: 'italic', fu: "'Noto Sans', sans-serif", k: 0.95 },
    hy: { fd: "'Noto Sans Armenian', sans-serif", fds: 'normal', fu: "'Noto Sans Armenian', sans-serif", k: 0.8 }
  };
  function href(page, l) { return PAGES[page] + '?lang=' + (l || lang); }
  function links(l) {
    var o = {};
    Object.keys(PAGES).forEach(function (p) { o[p] = href(p, l); });
    return o;
  }
  // Pages with no equivalent in another language fall back to that language's guides hub.
  function langLinks(page) {
    return ['en', 'ru', 'hy'].map(function (code) { return { code: code, href: href(page, code) }; });
  }
  function shot(name, l) {
    var base = (l || lang) === 'ru' ? 'ru' : 'en';
    return 'assets/screens/' + base + '-' + name + '.jpg';
  }
  var SITE = {
    store: 'https://apps.apple.com/app/id6813968416',
    email: 'bombardiro.dev@gmail.com',
    instagram: 'https://www.instagram.com/playbombardiro/',
    tiktok: 'https://www.tiktok.com/@playbombardiro',
    appPrivacy: 'https://z-amiryan.github.io/bombardiro/privacy-policy/',
    updated: '2026-11-02'
  };
  function storeUrl(placement) { return SITE.store; } // pt/ct campaign params added once APP_STORE_PT exists
  function badge(l) { return (l || lang) === 'ru' ? 'assets/app-store-ru.svg' : 'assets/app-store-en.svg'; }
  function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  window.BBSite = {
    lang: lang, PAGES: PAGES, FONTS: FONTS, SITE: SITE,
    copy: function (l) { return getJSON('content/' + (l || lang) + '.json'); },
    words: function (l) { return getJSON('content/words.' + (l || lang) + '.json'); },
    href: href, links: links, langLinks: langLinks, shot: shot, storeUrl: storeUrl, badge: badge,
    reducedMotion: reducedMotion
  };
})();
