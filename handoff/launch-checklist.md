# Launch checklist

## Build, done by Claude Code

- [x] All 28 pages exist and CI is green on `main`.
- [ ] Every agent in `.claude/agents/` has passed. Milestones 3–9 were audited by hand against each agent's
      checklist (code, copy, design, quality, SEO, tests) and every finding was fixed; the agents themselves
      weren't run, at the owner's request. Run them once before launch if you want their verdicts on record.
- [x] `handoff/DESIGN-DEVIATIONS.md` lists every departure from the design, or says there are none.
- [x] Lighthouse and budget results are in the final PR description.

## Owner, before the domain goes live

- [ ] Proofread all pages on the Vercel preview, in English, Russian and Armenian.
- [ ] Confirm the spelling Գոռ Ղազարյան on the About and Privacy pages.
- [ ] Set `APP_STORE_URL` in `src/config/site.ts`, and `APP_STORE_PT` if you have the provider token.
- [ ] Set `LAST_UPDATED` in `src/config/site.ts` to today.
- [ ] Add `bombardiro.app` and `www.bombardiro.app` in Vercel, with `www` redirecting to the apex.
- [ ] Add the DNS records Vercel shows at your registrar.
- [ ] Enable Web Analytics and Speed Insights on the Vercel project.

## Owner, on launch day

- [ ] Open bombardiro.app on an iPhone and on a computer. Tap the store link.
- [ ] Confirm the padlock, `www` redirect and a 404 page.
- [ ] Verify the site in Google Search Console, Bing Webmaster Tools and Yandex Webmaster, and submit
      `https://bombardiro.app/sitemap-index.xml` to each.
- [ ] Set the App Store **Marketing URL** to `https://bombardiro.app/`.
- [ ] Put the link in the Instagram and TikTok bios.

## Owner, in the first month

- [ ] Check indexing in Search Console and Yandex Webmaster every week.
- [ ] Note which searches appear, and send them to Claude to refine the guides.
- [ ] Create App Store campaign links once the provider token exists. Campaign data appears after more than a
      day, and only once a campaign has at least five installs.

## When in-app ads ship

- [ ] Change the two "no ads" answers in `content/copy/` (Home and Support, all three languages).
- [ ] Review Vercel's Hobby rules: a site promoting an ad-funded app counts as commercial use.
