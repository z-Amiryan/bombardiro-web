# Launch checklist

## Build, done by Claude Code

- [x] All 28 pages exist and CI is green on `main`.
- [x] Every agent's checklist in `.claude/agents/` has passed. After milestones 3–9, a whole-site audit went
      through each checklist in turn by hand, at the owner's request (SEO and copy in #9; code, design, quality
      and tests in #10), and every finding was fixed. The agents themselves weren't run as subagents.
- [x] `handoff/DESIGN-DEVIATIONS.md` lists every departure from the design, or says there are none.
- [x] Lighthouse and budget results are in the final PR description.

## Owner, before the domain goes live

- [ ] Proofread all pages on the Vercel preview, in English, Russian and Armenian.
- [x] Confirm the spelling Գոռ Ղազարյան on the About and Privacy pages (confirmed by the owner).
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
