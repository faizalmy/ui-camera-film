#!/usr/bin/env python3
"""List the components on a captured page, to write src/page/scene.ts from.

    python3 scripts/list_components.py public/page.html [--width 1440 --height 900] [--all]

Prints tag, data-slot, a short class, the box (page px), border width and
radius, and text, for header/nav/sections/headings/text/links/buttons/inputs
and anything with a data-slot, in the first viewport (or the whole page with
--all). Also saves public/page.png, a screenshot to plan shots on.
"""
import argparse, os
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("html")
ap.add_argument("--width", type=int, default=1440)
ap.add_argument("--height", type=int, default=900)
ap.add_argument("--all", action="store_true")
a = ap.parse_args()

with sync_playwright() as pw:
    try:
        b = pw.chromium.launch()
    except Exception:
        b = pw.chromium.launch(channel="chrome")
    p = b.new_page(viewport={"width": a.width, "height": a.height})
    p.goto("file://" + os.path.abspath(a.html))
    p.wait_for_timeout(1000)
    p.screenshot(path=os.path.splitext(a.html)[0] + ".png", full_page=a.all)
    rows = p.evaluate("""(all) => {
      const out = []
      for (const el of document.querySelectorAll('header,nav,main,section,footer,h1,h2,h3,p,a,button,input,img,[data-slot],[role=tab],li')) {
        const b = el.getBoundingClientRect(), s = getComputedStyle(el)
        if ((!all && b.top > innerHeight) || b.width < 16 || b.height < 10) continue
        out.push([el.tagName.toLowerCase(), el.getAttribute('data-slot') || '', String(el.className.baseVal ?? el.className).slice(0, 40),
          Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height), s.borderTopWidth, s.borderRadius,
          (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 32)])
      }
      return out
    }""", a.all)
    print("tag | slot | class | x y w h | border radius | text")
    for r in rows:
        print(f"{r[0]} | {r[1]} | {r[2]} | {r[3]} {r[4]} {r[5]} {r[6]} | {r[7]} {r[8]} | {r[9]}")
    b.close()
