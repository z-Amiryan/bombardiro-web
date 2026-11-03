# SEO rules

- URLs come only from `handoff/routes.json`. Don't change a URL after launch without a redirect.
- Every page has one `h1`, a unique title and description, a canonical, and hreflang links in `<head>`.
- All main content is in the delivered HTML, with real headings, lists and links.
- Never redirect by IP or browser language.
- Never add `aggregateRating` or `review` markup unless the numbers are real App Store data.
- Don't add FAQ markup, and don't generate pages from the word list.
- Always pair "Bombardiro" with football in titles and descriptions.
- `*.vercel.app` stays `noindex`. Only bombardiro.app gets indexed.
