"""Print the CV page to static/cv.pdf, the PDF the CV page embeds and offers for download.

Run after `node build.mjs`, then build again so the page picks the PDF up:

    node build.mjs && python scripts/print-cv.py && node build.mjs

Needs Playwright and Chromium (set CHROMIUM_PATH if Chromium is not on PATH).
Google Analytics is blocked so printing stays offline.
"""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import shutil
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT / 'static/cv.pdf'

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(DIST)))
threading.Thread(target=server.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{server.server_address[1]}'
browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=browser_path) if browser_path else p.chromium.launch()
    page = browser.new_page(color_scheme='light')
    page.route('**/*', lambda r: r.abort() if not r.request.url.startswith(base) else r.continue_())
    page.goto(base + '/cv/', wait_until='networkidle')
    page.evaluate('document.fonts.ready')
    page.pdf(path=str(OUT), format='A4', print_background=False, margin={'top': '16mm', 'bottom': '16mm', 'left': '14mm', 'right': '14mm'})
    browser.close()
server.shutdown()
print(f'wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)')
