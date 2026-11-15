# ui-camera-film

**A free Claude Code skill, given away by [ReUI](https://reui.io/?utm_source=github&utm_medium=readme&utm_campaign=ui-camera-film&utm_content=intro).** MIT licensed: take it, use it, ship
films with it.

Cinematic UI films in Remotion, for any web page or React component: a slow tilted 3D camera with shallow
depth of field, cut shots that lift from black, component layers that build in one by one, and a slow
light wave across component outlines during builds, slides and clicks. Every frame is a pure function of
time, so renders are byte-identical.

The template ships filming [reui.io](https://reui.io/?utm_source=github&utm_medium=readme&utm_campaign=ui-camera-film&utm_content=template). Point it at your own URL instead.

## Install as a Claude Code skill

```bash
git clone https://github.com/faizalmy/ui-camera-film.git ~/.claude/skills/ui-camera-film
```

Then ask Claude for "a 3D camera film of https://your-site.com". `SKILL.md` holds the workflow it follows.

## Quick start (by hand)

```bash
cp -R template my-film && cd my-film && npm i
pip install playwright && playwright install chromium   # once (or it uses installed Chrome)
python3 scripts/capture.py https://example.com public/page.html --width 1440 --height 900 --dark
npx remotion studio src/index.ts
```

Then run `python3 scripts/list_components.py public/page.html` (components with boxes, plus a screenshot),
rewrite `src/page/scene.ts` for your page (what builds in and where light waves run, as CSS selectors and
seconds), and set the shots in `src/page/PageCamera.tsx`.

## Layout

- `template/src/engine/` scene types, build-in engine, light-wave engine, `PageSubject`
- `template/src/CameraRig.tsx`, `rig.ts`, `layers/` camera, depth of field, pointer, grain, vignette
- `template/src/page/` example film of a captured page
- `template/scripts/capture.py` any URL to one self-contained static HTML file
- `examples/` choreography for two films of live React components

## Filming live React components

The two films in `examples/` drive real [ReUI Pro blocks](https://reui.io/blocks?utm_source=github&utm_medium=readme&utm_campaign=ui-camera-film&utm_content=examples_blocks) (`ai-usage-1`,
`agent-activity-1`) frame by frame: steps ticking, typing, a ruler drag, clicks. The choreography is free
and included. The blocks are not: get them with a [ReUI Pro license](https://reui.io/pricing?utm_source=github&utm_medium=readme&utm_campaign=ui-camera-film&utm_content=examples_pricing), or film any
React component of your own, such as the free, open source [ReUI components](https://reui.io/components?utm_source=github&utm_medium=readme&utm_campaign=ui-camera-film&utm_content=examples_components).
See `examples/README.md`.

## License

MIT, see `LICENSE`. Covers this code only: the ReUI Pro blocks the examples film are licensed separately
and not included.
