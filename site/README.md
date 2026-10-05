# adeelahmad.net

Source for [adeelahmad.net](https://adeelahmad.net/): the journey, technology timeline, skills, projects and Medium writing on one static page.

## What goes in here

Only publication copy. The private working record (transcripts, exports, CV drafts, client detail) stays outside this repository and must never be committed: this repo is public, including its history.

- `data/journey.json`: the story chapters on the opening view
- `data/public-timeline.json`: milestones, projects and the skills inventory
- `data/medium.json`: saved Medium posts, refreshed daily
- `data/writing-links.json`: which Medium post belongs to which milestone
- `data/private-terms.sha256`: hashed terms the build refuses to publish

## Build

```sh
node build.mjs
```

No install step. The build validates the data, refuses any hashed private term, and writes `dist/` (gitignored). To block a new term without writing it into the repo:

```sh
echo "Term to block" | node scripts/hash-terms.mjs >> data/private-terms.sha256
```

Browser checks: `python tests/smoke_test.py` (needs Playwright; set `CHROMIUM_PATH` if Chromium is not on PATH).

## Publishing

`.github/workflows/site.yml` builds on every push to `master` that touches `site/`, and daily to pick up new Medium posts. Medium's feed only lists the latest 10 posts, so `scripts/fetch-medium.mjs` merges new ones into `data/medium.json` and the workflow commits it. The workflow then deploys `dist/` to GitHub Pages.

One-time setup in the repository settings: **Pages → Source: GitHub Actions**, then **Custom domain: adeelahmad.net** with HTTPS enforced. DNS: apex `A` records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and `www` as `CNAME adeelahmad.github.io`. `blog.adeelahmad.net` stays on Medium.

## Runtime

Pages load Google Analytics (tag G-RKFB16BPXJ, in `scripts/analytics.mjs`) and nothing else from third parties: no remote fonts or CDNs. A hashed Content Security Policy allows only the analytics hosts, and the page stays readable with JavaScript disabled. It vendors React 16 (MIT notice in `vendor/NOTICE.txt`).
