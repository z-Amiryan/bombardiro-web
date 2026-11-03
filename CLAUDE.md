# Bombardiro website

The public website for Bombardiro, a football party word game for iPhone and iPad. It lives at bombardiro.app.

**Goals, in order:** get found in search, be good enough for an Awwwards jury, get people to install the app.

**`handoff/SPEC.md` is the contract. Read it before changing anything.**

## The rules that matter

- **Performance is the tie-breaker.** When a visual idea conflicts with a budget, find a cheaper way to do it.
- **Everything is free.** The owner pays only for the domain. No paid plan, add-on or service.
- **Static site.** All content is in the delivered HTML. It must read properly with JavaScript off.
- **No hard-coded text.** Interface and core-page text comes from `content/copy/{en,ru,hy}.json`, and every key
  exists in all three.
- **Three languages, three scripts.** Latin, Cyrillic and Armenian all have to look designed, not tolerated.
- **Truthful claims only.** `.claude/rules/copy.md` lists what must never be said.
- **Treat the app as published.** No "coming soon" anywhere. The only placeholder is the App Store link in
  `src/config/site.ts`.
- **No third-party requests.** Links out are fine. Scripts, fonts and images all come from this site.
- **Real screens only.** Never invent app UI.

## Commands

```text
npm run dev          local server
npm run build        production build into dist/
npm run check        type check, lint, unit tests, copy check
npm run check:copy   copy check only
npm run check:site   SEO, links, sitemap, JSON-LD and budgets on dist/
npm run test:e2e     Playwright against a local production build
npm run lhci         Lighthouse CI against a local production build
```

Always run tools through npm scripts. That's what picks up the pinned Node version.

## Working here

- Read the installed version's docs before using an API. Don't code from memory.
- Work on a branch, one PR per milestone in `handoff/SPEC.md` §15. Commit and push often, because a cloud
  sandbox can reset between turns.
- CI must be green and the reviewers in `.claude/agents/` must pass before merging.
- Record any departure from the design in `handoff/DESIGN-DEVIATIONS.md`.
- Never add secrets to this repo. It is public.
