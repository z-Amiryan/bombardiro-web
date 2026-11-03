# Performance rules

- Budgets are in `handoff/SPEC.md` §9 and CI enforces them. Never raise one to make a check pass.
- The largest paint is text or a preloaded image. It never waits for JavaScript, an intro or a font.
- Animate only `transform` and `opacity`. Don't animate layout properties.
- Prefer CSS scroll-driven animations and native view transitions, with a sensible fallback.
- Load effects after the page is interactive, only on capable devices, and never for reduced-motion users.
- Keep main-thread work short so INP stays under 150 ms. No long tasks on scroll.
- Every image has `width` and `height`. Reserve space for anything that loads late, so CLS stays under 0.05.
- Fonts are self-hosted. At most two preloads, and each language loads only its own faces.
- No third-party scripts, fonts, images or embeds.
