// Layer 3-4 data for ai-usage-1: shots and the pointer path, in panel px
// (panel 1024 x 597). Targets measured off UsageFlat with measure: true.
import { clickKeys, pointerFrom, shotAt, type Key, type Shot } from "../rig"
import { CLICKS, DRAG, dragP, STEP_FROM, STEP_TO } from "./timeline"

/** Slider thumb centre x for a (fractional) step: rail 21..667, 6 px inset, 81 stops. */
const thumbX = (step: number) => 27 + (step / 80) * 634
const RAIL_Y = 162

const PTR: Key<{ x: number; y: number; o: number }>[] = [
  [0.0, { x: 520, y: 260, o: 0 }],
  [10.0, { x: 480, y: 235, o: 0 }],
  [10.6, { x: 450, y: 210, o: 1 }],
  [DRAG.from - 0.1, { x: thumbX(STEP_FROM), y: RAIL_Y, o: 1 }],
  [DRAG.to + 0.3, { x: thumbX(STEP_TO), y: RAIL_Y, o: 1 }],
  ...clickKeys(CLICKS.model, { x: 190, y: 325 }),
  ...clickKeys(CLICKS.context, { x: 493, y: 526 }),
  ...clickKeys(CLICKS.interpreter, { x: 291, y: 526 }),
  ...clickKeys(CLICKS.annual, { x: 741, y: 492 }),
  ...clickKeys(CLICKS.save, { x: 864, y: 569 }),
  [CLICKS.save + 0.9, { x: 900, y: 610, o: 1 }],
  [CLICKS.save + 1.3, { x: 915, y: 625, o: 0 }],
]

export function usagePointer(t: number) {
  const p = pointerFrom(PTR, Object.values(CLICKS), t, [[DRAG.from, DRAG.to]])
  // While held, the tip rides the thumb's rail exactly (smooth, not per step).
  if (t >= DRAG.from && t <= DRAG.to) {
    p.x = thumbX(STEP_FROM + (STEP_TO - STEP_FROM) * dragP(t))
    p.y = RAIL_Y
  }
  return p
}

/** Seven shots, timed and paced off reference v1 (measured with phase
    correlation, % of frame width per second): front near-static (ref 0.25),
    macros close with a real pan across the action (ref 7.6), the tilted wide
    bleeding off the bottom-left with a slow drift (ref 1.9). Each shot lifts
    from near-black like the reference's cuts. */
/** Wide shells, then the build in two slow zoomed shots, then the story. */
export const SHOTS: Shot[] = [
  { from: 0.0, to: 2.4, a: { rx: 7, ry: -6, rz: 0.6, s: 0.6, lx: 512, ly: 300, dof: 0 }, b: { rx: 6, ry: -5, rz: 0.5, s: 0.63, lx: 512, ly: 298, dof: 0 } },
  // Build, zoomed in: the planner fills while the camera glides down it,
  // then the quote. Light waves cross each card's outlines (wave.ts).
  { from: 2.4, to: 6.6, a: { rx: 22, ry: -14, rz: 3, s: 1.45, lx: 330, ly: 190, dof: 5 }, b: { rx: 20, ry: -11, rz: 2.4, s: 1.5, lx: 340, ly: 420, dof: 5 } },
  { from: 6.6, to: 10.8, a: { rx: 22, ry: 14, rz: -3, s: 1.5, lx: 850, ly: 160, dof: 5 }, b: { rx: 20, ry: 11, rz: -2.4, s: 1.55, lx: 850, ly: 450, dof: 5 } },
  // The drag: pans from the thumb to the total as it climbs.
  { from: 10.8, to: 14.2, a: { rx: 34, ry: -24, rz: 6, s: 1.75, lx: 430, ly: 165, dof: 12 }, b: { rx: 32.5, ry: -20, rz: 5.3, s: 1.82, lx: 680, ly: 132, dof: 12 } },
  { from: 14.2, to: 16.8, a: { rx: 33, ry: -22, rz: 6, s: 2.0, lx: 200, ly: 350, dof: 12 }, b: { rx: 31, ry: -18, rz: 5, s: 2.08, lx: 310, ly: 335, dof: 12 } },
  { from: 16.8, to: 19.6, a: { rx: 32, ry: -24, rz: 6, s: 2.0, lx: 260, ly: 530, dof: 12 }, b: { rx: 30, ry: -20, rz: 5, s: 2.08, lx: 380, ly: 520, dof: 12 } },
  { from: 19.6, to: 23.0, a: { rx: 24, ry: 16, rz: -4, s: 1.3, lx: 820, ly: 250, dof: 5 }, b: { rx: 22, ry: 12, rz: -3, s: 1.38, lx: 850, ly: 330, dof: 5 } },
  { from: 23.0, to: 25.8, a: { rx: 32, ry: 20, rz: -6, s: 2.0, lx: 800, ly: 560, dof: 12 }, b: { rx: 30, ry: 16, rz: -5, s: 2.08, lx: 900, ly: 552, dof: 12 } },
  { from: 25.8, to: 30.4, a: { rx: 34, ry: -24, rz: 8, s: 1.35, lx: 430, ly: 390, dof: 4 }, b: { rx: 33, ry: -21, rz: 7, s: 1.4, lx: 370, ly: 360, dof: 4 } },
]
export const usageCam = (t: number) => shotAt(SHOTS, t)
/** Exposure: every shot lifts from near-black over 0.35 s, and the whole film
    sits darker (ref mean luma 9-15 on 255). */
export function usageFade(t: number) {
  const shot = SHOTS.find((x) => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1]
  const lift = Math.min(1, (t - shot.from) / 0.35)
  return 0.8 * (0.08 + 0.92 * (1 - Math.pow(1 - lift, 2)))
}

