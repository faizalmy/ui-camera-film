# ui-camera-film

Cinematic UI films in Remotion, for any web page or React component: a slow tilted 3D camera with shallow
depth of field, cut shots that lift from black, component layers that build in one by one, and a slow
light wave across component outlines during builds, slides and clicks. Every frame is a pure function of
time, so renders are byte-identical.

It is also a Claude Code skill (`SKILL.md`): drop the folder into `~/.claude/skills/`.

## Quick start

```bash
cp -R template my-film && cd my-film && npm i
pip install playwright && playwright install chromium   # once (or it uses installed Chrome)
python3 scripts/capture.py https://example.com public/page.html --width 1440 --height 900 --dark
npx remotion studio src/index.ts
```

Then `python3 scripts/list_components.py public/page.html` (components with boxes, plus a screenshot)
and rewrite `src/page/scene.ts` for your page (what builds in and where light waves run, as CSS selectors and seconds)
and the shots in `src/page/PageCamera.tsx`.

## Layout

- `template/src/engine/` scene types, build-in engine, light-wave engine, `PageSubject`
- `template/src/CameraRig.tsx`, `rig.ts`, `layers/` camera, depth of field, pointer, grain, vignette
- `template/src/page/` example film of a captured page
- `template/scripts/capture.py` any URL to one self-contained static HTML file
- `examples/` choreography for two films of live React components (ReUI Pro blocks, not included)

## License

MIT, see `LICENSE`. Covers this code only: the ReUI Pro blocks the examples film are licensed separately and not included.
