---
name: ui-camera-film
description: Film any web page or React UI in the Ultramock style with Remotion - a slow tilted 3D camera with shallow depth of field, cut shots that lift from black, component layers that build in one by one (rise, tick fill, wipe, count up, odometer roll), and a slow light wave that lights component outlines during builds, slides and clicks. Works on a captured URL (any site) or a live React component in "drive" mode. Use when asked for "the Ultramock style", a "3D camera on the UI" shot, a cinematic tilted product/website film with depth of field, a build-in or light-wave animation of a page's components, or to reuse the ui-camera-film rig on another page or block.
metadata:
  author: faizal
---

# UI camera film

Reference grammar: x.com/ultramock/status/2118776590318383538 (camera, DOF, cut shots) and
x.com/nizamdesign/status/2118946555785060781 (component build-in). Everything is a pure function of the
frame: render a frame twice and the PNGs are byte-identical.

## Start a film

1. Copy `template/` to a new folder, `npm i`.
2. **Any web page:** `python3 scripts/capture.py <url> public/page.html --width 1440 --height 900 [--dark] [--full]`
   (Playwright; falls back to installed Chrome). It scrolls once for lazy content, strips scripts and
   inlines every stylesheet, font and image, so the page renders offline, same-origin, identically per frame.
   **A React component** instead: see "React subjects" below.
3. List the first-screen elements and their boxes (Playwright on `file://public/page.html`, print tag,
   `data-slot`, class, rect, border radius) and screenshot it. Pick the components to build and light.
4. Write the scene (`src/page/scene.ts`): `layers` (build-in) + `sweeps` (light waves). Write shots and pointer
   keys (`src/page/PageCamera.tsx`) in page px.
5. Stills, not video: render 6-8 key frames into a contact sheet, zoom crops, render one frame twice and
   `cmp`. Add a `.claude/launch.json` entry (`npx remotion studio src/index.ts --port 3123 --no-open`) and hand
   over the Studio preview. Do not render the mp4 unless asked.

## Engine (`template/src/engine/`)

- `scene.ts`: the choreography as data. `Target` = `sel` under the root, or under the `nth` match of
  `scope` (`sel: ":scope"` = that element), `index` keeps one match.
- `build.ts` `applyBuild(root, t, layers)`: kinds `rise` (fade up `dist` px), `tick` (grow from bottom),
  `wipe` (reveal left to right), `count` (first number in the text counts from 0, keeps its format),
  `roll` (odometer digit strips, left digits settle first). `stagger` or `spread`, `children: true` for
  nodes that own their inline opacity (motion/AnimatePresence items), `riders` (e.g. separators) take no
  stagger slot. Touched nodes are marked `data-build` and restored when they land.
- `wave.ts` `applyWave(root, layer, t, sweeps)`: a soft warm band (sine eased) crosses `x0..x1` and lights
  the outlines it passes (border-only rings, mask exclude, gradient in root coordinates = one front).
  `seed` + `keep` light a deterministic random share; `always` for card panels. `clickSweep(at, pick)` =
  a 1.4 s wave across the pressed element only.
- `PageSubject.tsx`: the capture in an iframe; holds the render until load, fonts and images; applies both.
- Positions use offsetLeft/Top: the 3D camera breaks getBoundingClientRect.

## Direction (what the user asked for, keep it)

- **Slow, smooth, steady.** Ease-in-out everywhere, 0.7-1.8 s per layer, no snaps, no whip pans.
- **Wide first shot = shells only** (cards, header, titles). Never land the parts there.
- **Parts build in zoomed shots**, one region per shot (~4-4.6 s), camera gliding with the build.
- **Light wave:** only in zoomed shots, after that shot's parts land, over a random subset (never all).
  Also one per click (on the pressed part) and one slow sweep during a slide/drag (across the card,
  NOT following the thumb, never on the rail/thumb). Never in the wide shot.
- Shot grammar (ref v1): cut, not swept; each shot lifts from near-black in ~0.35 s; mean luma 9-15/255;
  front near-static, macro ~7 %w/s pan, tilted wide ~2 %w/s. Close shots `dof` 5-12, `focusScale` 1.6.

## Camera rig (`template/src/CameraRig.tsx`, `rig.ts`)

`CameraRig` props: `cam` (`rx ry rz s lx ly dof`), `panel()` (rendered twice for DOF, keep it pure),
`pointer`, `width`, `zoom`, `radius`, `slab`, `fade`, `focusScale`. `shotAt(shots, t)`, `shotFade(shots, t)`,
`pointerFrom(keys, clicks, t, holds)`, `clickKeys`. Layout zoom 1.5-2.5 so text stays sharp up close.

| # | Layer | File |
|---|---|---|
| 0 | bay `#050505` + grain (background only) | `CameraRig.tsx`, `layers/Finish.tsx` |
| 1 | subject: captured page or React component | `engine/PageSubject.tsx` or your panel |
| 2 | build-in cascade | `engine/build.ts` + scene |
| 3 | light-wave outlines | `engine/wave.ts` + scene |
| 4 | 3D plane, slab, DOF (blurred copy + sharp copy masked at the look point) | `CameraRig.tsx` |
| 5 | pointer inside the plane, press dip on clicks | `layers/Pointer.tsx` |
| 6 | vignette, per-shot fade | `layers/Finish.tsx`, `rig.ts` |

## React subjects (live state, real clicks)

A captured page is static: clicks are visual (pointer + wave). For state that changes on click, render the
component itself in "drive" mode: add an optional `drive` prop that overrides its state and turns every
timer off; keep markup, classes and durations. `examples/` holds two worked films on ReUI Pro blocks (the
choreography only; install the blocks yourself with the shadcn CLI and a license): `reui-ai-usage`
(ruler drag, radio card, chip toggles, switch, Save, all on the engine via `scene.ts`) and
`reui-agent-activity` (steps ticking, typing, approvals).

- **Seeked CSS transitions:** inside ~0.4 s after each state change, render the prior state with `.freeze`
  (transition none), flush style, commit the new state, pause every `CSSTransition` and seek it to
  (t - event). See `examples/reui-ai-usage/UsagePanel.tsx`. Each drag step is an event.
- **motion/react** runs on wall time: `MotionGlobalConfig.skipAnimations = true` in Root; OR it into any
  `useReducedMotion()` check.
- **Network images** race the screenshot: `delayRender` until the `<img>` is complete.
- **Toasts** fired from events cannot be replayed; end the click on its press or a state the UI shows.
- **Dark theme on `<html>`** (tokens resolve at `:root`). Load the UI's own fonts (`@remotion/google-fonts`).
- **Translucent panels glow through the DOF blur:** both copies sit on the same opaque plate (built in).
- **Multi-card subjects:** `slab={false}`, so the gap between cards stays bay colour.

## Gotchas

- Grain sits under the plane, never over the UI.
- Captures can be large (tens of MB with inlined images); fine for Remotion's static server.
- Fixed/sticky elements in a capture have offsetParent null: target their children or skip them.
- `rm` of a glob after `cd` is blocked by the safety check: write stills into a fresh `out/` folder.
