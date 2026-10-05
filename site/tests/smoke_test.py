"""Smoke-test the built site in dist/. Requires Python, Playwright and Chromium.

Set CHROMIUM_PATH when the browser is not on PATH. The pages are served from a local
HTTP server; Google Analytics requests are blocked so the test stays offline.
Screenshots and results are written to --output, outside the publishing bundle.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import argparse
import json
import os
import shutil
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=Path('/tmp/public-timeline-tests'))
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
D = json.loads((ROOT / 'data/public-timeline.json').read_text())
J = json.loads((ROOT / 'data/journey.json').read_text())
M = json.loads((ROOT / 'data/medium.json').read_text())
HTML = (DIST / 'index.html').read_text()
checks = []
def check(name, condition):
    assert condition, name
    checks.append({'test': name, 'passed': True})

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(DIST)))
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f'http://127.0.0.1:{server.server_address[1]}'
ANALYTICS = ('https://www.googletagmanager.com/', 'https://www.google-analytics.com/', 'https://region1.google-analytics.com/')

browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
if browser_path:
    launch['executable_path'] = browser_path

def visible(page, sel):
    return page.locator(sel + ':visible').count()

with sync_playwright() as p:
    browser = p.chromium.launch(**launch)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    errors, requests, console_errors = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append(r.url))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    page.route('**/*', lambda route: route.abort() if route.request.url.startswith(ANALYTICS) else route.continue_())
    page.goto(BASE + '/', wait_until='load')
    page.wait_for_function("document.documentElement.classList.contains('js')")
    check('Every journey chapter renders', page.locator('.chapter').count() == len(J['chapters']))
    check('Every public milestone renders', page.locator('.entry').count() == len(D['events']))
    check('Self-hosted fonts load', page.evaluate("document.fonts.check('16px \"DM Sans\"')"))
    check('Portrait loads', page.evaluate("document.querySelector('.intro__portrait').naturalWidth > 0"))
    check('Desktop has no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
    page.screenshot(path=str(args.output / 'home.png'))
    page.locator('.chapter').nth(2).locator('a[data-ids]').click()
    check('Chapter link filters to its entries', visible(page, '.entry') == len(J['chapters'][2]['eventIds']))
    page.locator('[data-toolbar] [data-clear]').click()
    q = page.locator('[data-toolbar] input[name=q]')
    q.fill('Firecracker')
    check('Timeline search matches technical work', visible(page, '.entry') >= 1)
    q.fill('[<')
    check('Search safely handles punctuation', visible(page, '.entry') == 0)
    q.fill('')
    page.locator('[name=period]').select_option('2023')
    check('Period filtering', visible(page, '.entry') == sum(e['period'] == '2023' for e in D['events']))
    page.locator('[name=kind]').select_option('Proposed')
    check('Type and period filtering combine', visible(page, '.entry') == sum(e['period'] == '2023' and e['kind'] == 'Proposed' for e in D['events']))
    page.locator('[data-toolbar] [data-clear]').click()
    check('Clear filters shows everything', visible(page, '.entry') == len(D['events']))
    page.locator('#skills a.skill[data-skill="AWS"]').click()
    check('Skill filters to its milestones', visible(page, '.entry') == sum('AWS' in e['skills'] for e in D['events']))
    page.locator('[data-toolbar] [data-clear]').click()
    page.evaluate("location.hash = 'event=milestone-044'"); page.wait_for_timeout(100)
    check('Old #event= links still reach the entry', page.locator('#milestone-044').is_visible() and 'Jira' in page.locator('#milestone-044').inner_text())
    check('All projects are listed', page.locator('.project').count() == len(D['projects']))
    check('Every post is listed', page.locator('#writing .post').count() == len(M['posts']))
    page.locator('[data-theme-toggle]').click()
    check('Theme toggle switches to dark', page.evaluate("document.documentElement.dataset.theme") == 'dark')
    page.locator('[data-theme-toggle]').click()
    for width in [390, 320]:
        page.set_viewport_size({'width': width, 'height': 844})
        check(f'{width}px has no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        page.screenshot(path=str(args.output / f'home-{width}.png'))
    page.set_viewport_size({'width': 1440, 'height': 1000})

    local_posts = [x for x in (DIST / 'blog').iterdir() if x.is_dir()]
    page.goto(BASE + '/blog/', wait_until='load')
    check('Writing index lists every post', page.locator('.post').count() == len(M['posts']))
    if local_posts:
        page.goto(BASE + f'/blog/{local_posts[0].name}/', wait_until='load')
        check('Post page renders its text', len(page.locator('.prose').inner_text()) > 200)
        check('Post page points its canonical URL at Medium', 'medium' in (page.locator('link[rel=canonical]').get_attribute('href') or '') or 'blog.adeelahmad.net' in (page.locator('link[rel=canonical]').get_attribute('href') or ''))
    CV = json.loads((ROOT / 'data/cv.json').read_text())
    page.goto(BASE + '/cv/', wait_until='load')
    check('CV page lists every role', page.locator('#experience .entry').count() == len(CV['experience']))
    check('CV page embeds the PDF', page.locator('iframe.cv__frame').count() == 1 and page.request.get(BASE + '/cv.pdf').headers.get('content-type') == 'application/pdf')
    check('CV page has no phone number', not __import__('re').search(r'\+\d[\d ]{8,}', page.content()))
    page.goto(BASE + '/skills/aws/', wait_until='load')
    check('Skill page lists its entries', page.locator('.entry').count() == sum('AWS' in e['skills'] for e in D['events']))

    check('External links use safe opener settings', page.locator('a[target="_blank"]:not([rel*="noopener"])').count() == 0)
    check('No JavaScript errors', not errors)
    # Medium images on post pages are allowed by the CSP but may be unreachable offline.
    check('No console or CSP errors', not [m for m in console_errors if 'googletagmanager' not in m and 'ERR_' not in m])
    check('No automatic external requests except analytics and post images', not [u for u in requests if u.startswith(('http:', 'https:')) and not u.startswith((BASE,) + ANALYTICS) and 'medium.com' not in u])
    check('Analytics tag is on every page', all('G-RKFB16BPXJ' in f.read_text() for f in DIST.rglob('*.html')))

    static = browser.new_page(java_script_enabled=False, viewport={'width': 1440, 'height': 1000})
    static.goto(BASE + '/', wait_until='load')
    check('All milestones readable with JavaScript disabled', visible(static, '.entry') == len(D['events']))
    check('Journey readable with JavaScript disabled', visible(static, '.chapter') == len(J['chapters']))
    check('Search toolbar hidden without JavaScript', visible(static, '[data-toolbar]') == 0)
    check('Inventory readable with JavaScript disabled', static.locator('.inventory__area').count() == len(D['domains']))
    browser.close()
server.shutdown()
check('Unique event IDs', len({e['id'] for e in D['events']}) == len(D['events']))
check('Every milestone has skill mapping', all(e['skills'] for e in D['events']))
report = {'passed': len(checks), 'failed': 0, 'checks': checks, 'milestones': len(D['events']), 'projects': len(D['projects'])}
(args.output / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
