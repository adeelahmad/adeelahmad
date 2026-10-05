# adeelahmad.net

Source for [adeelahmad.net](https://adeelahmad.net/): the journey, technology timeline, skills, projects and Medium writing as plain static pages (the "Ledger" design from Claude Design).

## What goes in here

Only publication copy. The private working record (transcripts, exports, CV drafts, client detail) stays outside this repository and must never be committed: this repo is public, including its history.

- `data/journey.json`: the story chapters on the opening view
- `data/public-timeline.json`: milestones, projects and the skills inventory
- `data/medium.json`: saved Medium posts, refreshed daily
- `data/writing-links.json`: which Medium post belongs to which milestone
- `data/publications.json`: talks and reports for `/publications/`; an item with a `page` also gets its own page (the talk recording plays from YouTube only when the reader presses play)
- `data/private-terms.sha256`: hashed terms the build refuses to publish

## Build

```sh
node build.mjs
```

No install step. The build validates the data, renders the pages with `src/render.mjs`, refuses any hashed private term in the data or the rendered pages, and writes `dist/` (gitignored): the home page, `blog/` with a page per saved post, `skills/<skill>/` (one page per skill, so skill links work without JavaScript), plus `timeline.md`, `llms.txt`, `sitemap.xml` and `robots.txt`.

- `src/render.mjs`: page templates. `SITE`, `CHAPTER_FIGURES` and `PROJECT_AREAS` at the top hold the intro line, the chapter photo and the project groups.
- `src/styles.css`: all styling, light and dark.
- `src/site.js`: optional enhancements (theme toggle, timeline search and filters, skill filtering, old `#event=` links).
- `static/`: copied as is (images, fonts, favicons and web manifest, share image, CNAME). `static/cv.pdf`, when present, becomes `/cv/`: the header, a download button and the PDF, full width.

To block a new term without writing it into the repo:

```sh
echo "Term to block" | node scripts/hash-terms.mjs >> data/private-terms.sha256
```

Browser checks: `python tests/smoke_test.py` (needs Playwright; set `CHROMIUM_PATH` if Chromium is not on PATH).

## Publishing

`.github/workflows/site.yml` builds on every push to `master` that touches `site/`, and daily to pick up new Medium posts. Medium's feed only lists the latest 10 posts, so `scripts/fetch-medium.mjs` merges new ones into `data/medium.json` and the workflow commits it. The workflow then deploys `dist/` to GitHub Pages.

One-time setup in the repository settings: **Pages → Source: GitHub Actions**, then **Custom domain: adeelahmad.net** with HTTPS enforced. DNS: apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and `www` as `CNAME adeelahmad.github.io`. `blog.adeelahmad.net` stays on Medium.

## Runtime

Pages load Google Analytics (tag G-RKFB16BPXJ, in `scripts/analytics.mjs`) and nothing else from third parties; post pages may also show images from Medium's image hosts, and the talk page loads YouTube's player only after the reader presses play. Fonts are self-hosted (DM Sans and JetBrains Mono, OFL, see `static/fonts/LICENSE.txt`). A Content Security Policy with a hashed inline script allows only these, and every page is complete with JavaScript disabled.
