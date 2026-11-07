#!/usr/bin/env python3
"""Capture any web page as one self-contained, static HTML file for Remotion.

    python3 scripts/capture.py https://example.com public/page.html --width 1440 --height 900 [--dark] [--full]

The page loads in headless Chromium (Playwright), lazy content is scrolled in,
then scripts are removed and every stylesheet, font and image is inlined as a
data URI. CSS animations are parked on their end state (entrances visible),
canvases become images, CSS-in-JS rules (insertRule) are written out.
Not captured: shadow DOM, adoptedStyleSheets, <video> (a poster frame at most). The result renders identically on every frame, offline, from the
same origin as the composition, so the engine can animate its DOM.
"""
import argparse, base64, mimetypes, re, sys
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

FREEZE = """<style data-capture>
*,*::before,*::after{animation-delay:-1000s!important;animation-play-state:paused!important;transition:none!important;caret-color:transparent!important}
html{scrollbar-width:none}html::-webkit-scrollbar{display:none}
body{position:relative}
</style>"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("out")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", type=int, default=900)
    ap.add_argument("--dark", action="store_true", help="prefers-color-scheme: dark")
    ap.add_argument("--full", action="store_true", help="keep the full page height, not just the first viewport")
    ap.add_argument("--wait", type=int, default=1500, help="extra settle time, ms")
    a = ap.parse_args()

    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch()
        except Exception:
            # Playwright's own Chromium missing or a different build: use installed Chrome.
            browser = pw.chromium.launch(channel="chrome")
        ctx = browser.new_context(viewport={"width": a.width, "height": a.height}, color_scheme="dark" if a.dark else "light", device_scale_factor=1)
        page = ctx.new_page()
        try:
            page.goto(a.url, wait_until="networkidle", timeout=30000)
        except Exception:
            # Long-polling or streaming sites never go idle: settle on load instead.
            page.goto(a.url, wait_until="load", timeout=60000)
        # Scroll through once so lazy images and in-view reveals fire, then back to top.
        page.evaluate("""async () => {
          for (let y = 0; y < Math.min(document.body.scrollHeight, 20000); y += innerHeight / 2) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)) }
          scrollTo(0, 0)
        }""")
        page.wait_for_timeout(a.wait)
        cache = {}

        def data_uri(url):
            if url.startswith("data:") or not url.startswith("http"):
                return url
            if url in cache:
                return cache[url]
            try:
                r = ctx.request.get(url, timeout=30000)
                if not r.ok:
                    raise RuntimeError(f"HTTP {r.status}")
                body = r.body()
                ctype = (r.headers.get("content-type") or mimetypes.guess_type(url)[0] or "application/octet-stream").split(";")[0]
                cache[url] = f"data:{ctype};base64,{base64.b64encode(body).decode()}"
            except Exception as e:
                print(f"skip {url}: {e}", file=sys.stderr)
                cache[url] = url
            return cache[url]

        def inline_css(css, base):
            # @import first (one level), or the url() pass turns it into a data URI it cannot fetch.
            def imp(m):
                href = urljoin(base, m.group(2))
                try:
                    r = ctx.request.get(href)
                    return inline_css(r.text(), href) if r.ok else ""
                except Exception:
                    return ""
            css = re.sub(r"""@import\s+(?:url\()?(['"])([^'"]+)\1\)?[^;]*;""", imp, css)
            def rep(m):
                u = m.group(2).strip()
                if u.startswith("data:") or u.startswith("#"):
                    return m.group(0)
                return f'url("{data_uri(urljoin(base, u))}")'
            return re.sub(r"""url\((['"]?)([^'")]+)\1\)""", rep, css.replace("&amp;", "&"))

        # Freeze the DOM as rendered: absolute URLs, current image sources, no scripts.
        info = page.evaluate("""() => {
          // CSS-in-JS (insertRule) lives only in the CSSOM: write it into the <style>.
          document.querySelectorAll('style').forEach(st => {
            try { const rules = [...st.sheet.cssRules].map(r => r.cssText).join('\\n'); if (rules.length > st.textContent.length) st.textContent = rules } catch (e) {}
          })
          // Canvases (WebGL heroes, charts) become images of their current pixels.
          document.querySelectorAll('canvas').forEach(c => {
            try {
              const img = document.createElement('img'); img.src = c.toDataURL('image/png')
              img.className = c.className; img.style.cssText = c.style.cssText
              const b = c.getBoundingClientRect(); img.width = b.width; img.height = b.height
              c.replaceWith(img)
            } catch (e) {}
          })
          document.querySelectorAll('script,noscript,iframe,meta[http-equiv=refresh],link[rel=preload],link[rel=modulepreload],link[rel=prefetch]').forEach(n => n.remove())
          document.querySelectorAll('*').forEach(el => { for (const at of [...el.attributes]) if (at.name.startsWith('on')) el.removeAttribute(at.name) })
          document.querySelectorAll('img').forEach(img => {
            if (img.currentSrc) img.setAttribute('src', img.currentSrc)
            img.removeAttribute('srcset'); img.removeAttribute('sizes'); img.removeAttribute('loading')
          })
          document.querySelectorAll('source').forEach(s => s.remove())
          const sheets = [...document.querySelectorAll('link[rel=stylesheet]')].map((l, i) => { l.setAttribute('data-capture-sheet', String(i)); return [l.href, l.media || ''] })
          // Freeze form state into attributes.
          document.querySelectorAll('input').forEach(i => i.setAttribute('value', i.value))
          return { sheets, html: '<!doctype html>' + document.documentElement.outerHTML, base: location.href }
        }""")
        browser_sheets = []
        for href, media in info["sheets"]:
            try:
                r = ctx.request.get(href)
                if not r.ok:
                    raise RuntimeError(f"HTTP {r.status}")
                css = inline_css(r.text(), href)
                # Keep the link's media condition (print sheets stay print-only).
                browser_sheets.append(f"@media {media}{{{css}}}" if media and media != "all" else css)
            except Exception as e:
                print(f"skip sheet {href}: {e}", file=sys.stderr)
                browser_sheets.append("")
        html = info["html"]
        for i, css in enumerate(browser_sheets):
            html = re.sub(rf'<link[^>]*data-capture-sheet="{i}"[^>]*>', lambda m: f"<style>{css}</style>", html, count=1)
        # Inline <style> blocks and style="" attributes with url(...).
        html = re.sub(r"(<style[^>]*>)(.*?)(</style>)", lambda m: m.group(1) + inline_css(m.group(2), info["base"]) + m.group(3), html, flags=re.S)
        html = re.sub(r'(\sstyle=")([^"]*url\([^"]*)(")', lambda m: m.group(1) + inline_css(m.group(2).replace("&quot;", '"'), info["base"]).replace('"', "'") + m.group(3), html)
        # Images (src="https://...").
        html = re.sub(r'(<img[^>]*\ssrc=")([^"]+)(")', lambda m: m.group(1) + data_uri(urljoin(info["base"], m.group(2).replace("&amp;", "&"))) + m.group(3), html)
        html = re.sub(r'(<image[^>]*\s(?:xlink:)?href=")([^"]+)(")', lambda m: m.group(1) + data_uri(urljoin(info["base"], m.group(2).replace("&amp;", "&"))) + m.group(3), html)
        html = html.replace("</head>", FREEZE + "</head>", 1)
        if not a.full:
            html = html.replace("</head>", f"<style>html,body{{height:{a.height}px!important;overflow:hidden!important}}</style></head>", 1)
        left = sorted(set(re.findall(r'(?:src|href)="(https?://[^"]+\.(?:png|jpe?g|webp|gif|svg|avif|woff2?|css))"', html)))
        if left:
            print(f"warning: {len(left)} remote assets left (they load from the network at render): {left[:5]}", file=sys.stderr)
        open(a.out, "w", encoding="utf-8").write(html)
        browser.close()
    print(f"{a.out}: {len(html) / 1e6:.1f} MB, {len(cache)} assets inlined")

if __name__ == "__main__":
    main()
