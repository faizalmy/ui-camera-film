// The ai-usage-1 film as a Scene for the generic engine (src/engine).
// Wide shot (0-2.4 s): card shells and titles only. Planner zoom (2.4-6.6 s):
// ruler ticks fill, model cards, add-on chips. Quote zoom (6.6-10.8 s): total
// and rate roll like an odometer, runway draws, line items, annual row, Save.
// Waves: one per zoomed shot over a random subset, one during the ruler
// drag, one per click. None in the wide shot.
import { clickSweep, type Layer, type Scene, type Sweep } from "../engine/scene"
import { CLICKS, DRAG } from "./timeline"

const FRAME = '[data-slot="frame"]'
const P = { scope: FRAME, nth: 0 } // planner card
const Q = { scope: FRAME, nth: 1 } // quote card
const QP = ":scope > :nth-child(2)" // quote panel: total, runway, rule, items, annual

const layers: Layer[] = [
  // Wide: shells and titles.
  { ...P, sel: ":scope", at: 0.0, dur: 1.0, dist: 30 },
  { ...Q, sel: ":scope", at: 0.2, dur: 1.0, dist: 30 },
  { ...P, sel: ":scope > :nth-child(1)", at: 0.9, dur: 0.8 },
  { ...Q, sel: ":scope > :nth-child(1)", at: 1.0, dur: 0.8 },
  // Planner zoom: sections in turn (separators ride with the next one).
  { ...P, sel: ":scope > :nth-child(2) > *", at: 2.6, dur: 0.9, stagger: 0.7, riders: '[data-slot="separator"]' },
  { sel: '[data-slot="frame-panel"] .h-7 > span', kind: "tick", at: 2.8, dur: 0.5, spread: 1.6 },
  { sel: '[data-slot="radio-group"] > *', at: 3.5, dur: 0.8, stagger: 0.15, dist: 10 },
  { sel: '[data-slot="toggle-group"] > *', at: 4.2, dur: 0.7, stagger: 0.1, dist: 8 },
  // Quote zoom.
  { ...Q, sel: `${QP} > :nth-child(1)`, at: 6.8, dur: 0.9 },
  { ...Q, sel: `${QP} > :nth-child(1) p > span.inline-flex`, index: 0, kind: "roll", at: 6.9, dur: 1.6, stagger: 0.12 },
  { ...Q, sel: `${QP} > :nth-child(1) p > span.inline-flex`, index: 1, kind: "roll", at: 7.2, dur: 1.4, stagger: 0.1 },
  { ...Q, sel: `${QP} > :nth-child(2)`, kind: "wipe", at: 7.4, dur: 1.8 },
  { ...Q, sel: `${QP} > :nth-child(3)`, kind: "wipe", at: 8.2, dur: 1.0 },
  // Annual row and Save land before the quote wave crosses them.
  // Line items are motion elements that own their opacity: animate their contents.
  { ...Q, sel: `${QP} > :nth-child(4) > *`, children: true, at: 8.3, dur: 0.8, stagger: 0.18, dist: 8 },
  { ...Q, sel: `${QP} > :nth-child(5)`, at: 8.5, dur: 0.8 },
  { ...Q, sel: ":scope > :nth-child(3)", at: 8.7, dur: 0.8 },
]

const PANEL = '[data-slot="frame-panel"]'
const sweeps: Sweep[] = [
  // Planner zoom (x 0-670): panel always, random cards and chips.
  {
    from: 4.6, to: 6.6, x0: 0, x1: 670, seed: 1, keep: 0.45,
    picks: [{ ...P, sel: PANEL, always: true }, { ...P, sel: '[data-slot="radio-group"] > *' }, { ...P, sel: '[data-slot="toggle-group"] > *' }],
  },
  // Quote zoom (x 680-1024): panel always; switch, Save and badges at random
  // (seed 3 lights Save and one badge). Crosses mid-card at frame 565.
  {
    from: 8.6, to: 10.8, x0: 680, x1: 1024, seed: 3, keep: 0.55,
    picks: [{ ...Q, sel: PANEL, always: true }, { ...Q, sel: '[data-slot="switch"]' }, { ...Q, sel: "footer button" }, { ...Q, sel: '[data-slot="badge"]' }],
  },
  // Ruler drag: one slow sweep across the planner, never on the rail or thumb.
  {
    from: DRAG.from, to: DRAG.to + 0.4, x0: 0, x1: 670, seed: 3, keep: 0.5,
    picks: [
      // The tight drag shot keeps the panel edge out of frame: the tier pill is always lit.
      { ...P, sel: ".bg-primary\\/10", always: true },
      { ...P, sel: PANEL, always: true },
      { ...P, sel: '[data-slot="badge"]' },
      { ...P, sel: '[data-slot="radio-group"] > *' },
    ],
  },
  // One wave across each pressed part.
  clickSweep(CLICKS.model, { ...P, sel: '[data-slot="radio-group"] > *', index: 0 }),
  clickSweep(CLICKS.context, { ...P, sel: '[data-slot="toggle-group"] > *', index: 2 }),
  clickSweep(CLICKS.interpreter, { ...P, sel: '[data-slot="toggle-group"] > *', index: 1 }),
  clickSweep(CLICKS.annual, { ...Q, sel: '[data-slot="switch"]', index: 0 }),
  clickSweep(CLICKS.save, { ...Q, sel: "footer button", index: 0 }),
]

export const USAGE_SCENE: Scene = { layers, sweeps }
