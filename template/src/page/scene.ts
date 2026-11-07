// Example: any web page through the engine. The page is a static capture
// (scripts/capture.py https://reui.io public/page.html --dark), 1440 x 900.
// Swap the capture and these selectors/times for any other page.
//
//   wide    0.0-2.4   header and the preview frame only
//   hero    2.4-7.0   pill, headline words, subline, buttons; wave; click Watch Intro
//   toolbar 7.0-11.6  breadcrumb, tool groups, counter 31/36 counts; wave; click Customize
//   wide    11.6-14   tilted pull back
import { clickSweep, type Layer, type Scene, type Sweep } from "../engine/scene"

export const PAGE = { src: "page.html", width: 1440, height: 900 }
export const PAGE_DURATION_S = 14
// Click waves last 1.4 s and must end before their shot cuts (7.0, 11.6).
export const CLICKS = { intro: 5.5, customize: 10.1 }

const HERO = { scope: "main section", nth: 0 }
const BAR = '[data-slot="frame-panel-header"]'

const layers: Layer[] = [
  // Wide: shells only.
  { sel: "header", index: 0, at: 0.0, dur: 1.0, dist: 20 },
  { sel: '[data-slot="frame"]', index: 0, at: 0.3, dur: 1.1, dist: 40 },
  { sel: 'header a[data-slot="button"]', index: 3, kind: "count", at: 0.8, dur: 1.4 },
  // Hero zoom.
  { ...HERO, sel: "a.group", index: 0, at: 2.6, dur: 0.9 },
  { sel: "h1 > *", at: 2.9, dur: 0.9, stagger: 0.16, dist: 18 },
  { ...HERO, sel: "p", index: 0, at: 3.8, dur: 0.9 },
  { ...HERO, sel: 'a[data-slot="button"]', at: 4.3, dur: 0.8, stagger: 0.18, dist: 10 },
  // Toolbar zoom.
  { sel: `${BAR} [data-slot="select-trigger"]`, at: 7.2, dur: 0.8, stagger: 0.2, dist: 8 },
  { sel: `${BAR} [data-slot="select-trigger"] span:last-child`, index: 2, kind: "count", at: 7.4, dur: 1.4 },
  { sel: `${BAR} [data-slot="button-group"] > *`, at: 7.8, dur: 0.6, spread: 1.4, dist: 8 },
  { sel: `${BAR} > :last-child > :last-child`, at: 9.0, dur: 0.8, dist: 8 },
]

const sweeps: Sweep[] = [
  // Hero: pill always, one button at random (seed 3).
  { from: 5.0, to: 7.0, x0: 300, x1: 1150, seed: 3, keep: 0.6, picks: [{ ...HERO, sel: "a.group", index: 0, always: true }, { ...HERO, sel: 'a[data-slot="button"]' }] },
  // Toolbar: frame panel always, tools at random.
  {
    from: 9.0, to: 11.4, x0: 50, x1: 1390, seed: 2, keep: 0.4,
    picks: [{ sel: '[data-slot="frame-panel"]', index: 0, always: true }, { sel: `${BAR} [data-slot="select-trigger"]` }, { sel: `${BAR} [data-slot="button-group"] > *` }],
  },
  clickSweep(CLICKS.intro, { ...HERO, sel: 'a[data-slot="button"]', index: 0 }),
  clickSweep(CLICKS.customize, { sel: `${BAR} > :last-child > :last-child`, index: 0 }),
]

export const PAGE_SCENE: Scene = { layers, sweeps }
