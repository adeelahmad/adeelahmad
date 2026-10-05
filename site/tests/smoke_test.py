"""Smoke-test the public page. Requires Python, Playwright and Chromium.

Set CHROMIUM_PATH when the browser is not on PATH. No server or network is used.
Screenshots and results are written to --output, outside the publishing bundle.
"""
from pathlib import Path
import argparse
import json
import os
import shutil
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--output', type=Path, default=Path('/tmp/public-timeline-tests'))
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=True)
D = json.loads((ROOT / 'data/public-timeline.json').read_text())
J = json.loads((ROOT / 'data/journey.json').read_text())
M = json.loads((ROOT / 'data/medium.json').read_text())
HTML = (ROOT / 'dist/index.html').read_text()
checks = []
def check(name, condition):
    assert condition, name
    checks.append({'test': name, 'passed': True})

browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
launch = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
if browser_path:
    launch['executable_path'] = browser_path
with sync_playwright() as p:
    browser = p.chromium.launch(**launch)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
    errors, requests, console_errors = [], [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: requests.append(r.url))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)
    # Analytics is the only allowed third party; block it so tests stay offline.
    ANALYTICS = ('https://www.googletagmanager.com/', 'https://www.google-analytics.com/', 'https://region1.google-analytics.com/')
    page.route('**/*', lambda route: route.abort() if route.request.url.startswith(ANALYTICS) else route.continue_())
    page.set_content(HTML, wait_until='load')
    page.wait_for_function('window.__PUBLIC_TIMELINE_READY__ === true')
    check('Journey opens first with every chapter', page.locator('.chapter').count() == len(J['chapters']))
    page.screenshot(path=str(args.output / 'journey.png'))
    page.locator('.chapter').nth(2).locator('.text-button').click()
    check('Chapter opens its milestones', page.locator('.event-row').count() == len(J['chapters'][2]['eventIds']))
    page.locator('.nav-link').filter(has_text='Writing').click()
    check('Every saved Medium post renders', page.locator('.post-card').count() == len(M['posts']))
    page.screenshot(path=str(args.output / 'writing.png'))
    page.locator('.nav-link').filter(has_text='Timeline').click()
    check('Every public milestone renders', page.locator('.event-row').count() == len(D['events']))
    check('Desktop has no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
    page.screenshot(path=str(args.output / 'desktop.png'))
    page.evaluate("location.hash = 'event=milestone-044'"); page.wait_for_timeout(100)
    check('Entry link selects the actual proposal', page.locator('.event-row').count() == 1 and 'Jira' in page.locator('.event-row').inner_text())
    page.locator('.event-context summary').click()
    check('Context distinguishes a proposal', 'Proposed' in page.locator('.event-row').inner_text())
    check('Milestone hash is shareable', page.evaluate("location.hash.startsWith('#event=milestone-')"))
    page.get_by_role('button', name='Clear filters', exact=True).click()
    page.locator('#timeline-search').fill('Firecracker')
    check('Timeline search matches technical work', page.locator('.event-row').count() >= 1)
    page.locator('#timeline-search').fill('[<')
    check('Search safely handles punctuation', page.locator('.event-row').count() == 0)
    page.get_by_role('button', name='Clear filters', exact=True).click()
    page.locator('#period-filter').select_option('2023')
    check('Period filtering', page.locator('.event-row').count() == sum(e['period'] == '2023' for e in D['events']))
    page.locator('#kind-filter').select_option('Proposed')
    check('Type and period filtering combine', page.locator('.event-row').count() == sum(e['period'] == '2023' and e['kind'] == 'Proposed' for e in D['events']))
    page.get_by_role('button', name='Clear filters', exact=True).click()
    first = page.locator('.event-row').first.get_attribute('data-event-id')
    page.get_by_role('button', name='Reverse timeline order', exact=True).click()
    check('Reverse order changes first record', page.locator('.event-row').first.get_attribute('data-event-id') != first)
    page.get_by_role('button', name='Reverse timeline order', exact=True).click()
    page.locator('#highlights-only').check()
    check('Highlights filter', page.locator('.event-row').count() == sum(e['featured'] for e in D['events']))
    page.get_by_role('button', name='Clear filters', exact=True).click()
    page.locator('.nav-link').filter(has_text='Skills').click()
    page.locator('#skills-search').fill('Firecracker')
    check('Skill index search', page.locator('.skill-card').count() == 1)
    page.locator('.skill-card').click()
    check('Skill traces to milestones', page.locator('.event-row').count() == sum('Firecracker' in e['skills'] for e in D['events']))
    page.locator('.nav-link').filter(has_text='Skills').click()
    page.get_by_role('button', name='Everything I’ve used', exact=True).click()
    check('Self-reported inventory is explicitly labelled', 'Self-reported experience' in page.locator('.inventory').inner_text())
    page.locator('.nav-link').filter(has_text='Projects').click()
    check('All selected projects are present', page.locator('.project-card').count() == len(D['projects']))
    page.locator('.project-card').first.get_by_role('button', name='Dated entries →', exact=True).click()
    check('Projects link back to actual milestones', page.locator('.event-row').count() == len(D['projects'][0]['eventIds']))
    page.get_by_role('button', name='About this record', exact=True).click()
    check('Evidence and scope are visible', page.locator('.method-item').count() == len(D['method']))
    with page.expect_download() as download:
        page.get_by_role('button', name='Export public timeline JSON', exact=True).click()
    payload = json.loads(Path(download.value.path()).read_text())
    check('JSON export is exactly the approved public model', payload == D)
    check('Export filename is public-specific', download.value.suggested_filename == 'adeel-ahmad-public-timeline.json')
    for width in [390, 320]:
        page.set_viewport_size({'width': width, 'height': 844})
        for view in ['Journey', 'Timeline', 'Skills', 'Projects', 'Writing']:
            page.locator('.nav-link').filter(has_text=view).click()
            check(f'{width}px {view} has no horizontal overflow', page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
        page.locator('.nav-link').filter(has_text='Timeline').click()
        page.evaluate("location.hash = 'event=milestone-044'"); page.wait_for_timeout(100)
        page.screenshot(path=str(args.output / f'milestone-{width}.png'))
    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.locator('.nav-link').filter(has_text='Timeline').click()
    page.locator('#timeline-search').fill('2021')
    page.screenshot(path=str(args.output / 'timeline-detail.png'))
    check('External links use safe opener settings', page.locator('a[target="_blank"]:not([rel*="noopener"])').count() == 0)
    check('No JavaScript errors', not errors)
    check('No console or CSP errors', not [m for m in console_errors if 'googletagmanager' not in m and 'ERR_FAILED' not in m])
    check('No automatic external requests except analytics', not [u for u in requests if u.startswith(('http:', 'https:')) and not u.startswith(ANALYTICS)])
    check('Analytics tag is present', 'G-RKFB16BPXJ' in HTML)
    static = browser.new_page(java_script_enabled=False, viewport={'width': 1440, 'height': 1000})
    static.set_content(HTML)
    check('All milestones readable with JavaScript disabled', static.locator('.event-row').count() == len(D['events']))
    check('All projects readable with JavaScript disabled', static.locator('.project-card').count() == len(D['projects']))
    check('Static page includes skills', static.locator('.domain-block').count() == len(D['domains']))
    check('Journey readable with JavaScript disabled', static.locator('.chapter').count() == len(J['chapters']))
    check('Writing readable with JavaScript disabled', static.locator('.post-card').count() == len(M['posts']))
    browser.close()
check('Unique event IDs', len({e['id'] for e in D['events']}) == len(D['events']))
check('Every milestone has skill mapping', all(e['skills'] for e in D['events']))
report = {'passed': len(checks), 'failed': 0, 'checks': checks, 'rendering_method': 'Chromium through Playwright set_content. File URL navigation was not tested by this script.', 'milestones': len(D['events']), 'projects': len(D['projects'])}
(args.output / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
