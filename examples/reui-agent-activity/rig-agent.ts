// agent-activity-1 camera keys, measured bands and pointer path (merge into src/rig.ts).
import { at, pointerFrom, track, type Key } from "../../template/src/rig"
import { CLICKS } from "./timeline"

/** Centre of the live band per step, measured off renders (panel px). Each
    change eases over 0.5 s, so focus glides down the list with the run. */
const LIVE_Y: Key<{ y: number }>[] = [
  [0.0, { y: 167 }],
  [1.3, { y: 203 }],
  [2.7, { y: 266 }],
  [4.9, { y: 297 }],
  [6.4, { y: 358 }],
  [8.0, { y: 369 }],
  [9.5, { y: 398 }],
  [10.7, { y: 427 }],
  [11.7, { y: 502 }],
]
/** Panel height per step (panel px), measured the same way. */
const PANEL_H: Key<{ y: number }>[] = [
  [0.0, { y: 417 }],
  [1.3, { y: 453 }],
  [2.7, { y: 497 }],
  [4.9, { y: 477 }],
  [6.4, { y: 515 }],
  [8.0, { y: 477 }],
  [9.5, { y: 505 }],
  [10.7, { y: 535 }],
  [11.7, { y: 565 }],
]
export const liveY = (t: number) => track(LIVE_Y, t)
export const panelH = (t: number) => track(PANEL_H, t)

/** Camera shots, reference v1: establish, push in tilted, slide to the
    action, swing to the other side to show the edge, settle front-on.
    rx/ry/rz degrees, s scale, lx look point x (panel px), dof blur px. */
const CAM: Key<{ rx: number; ry: number; rz: number; s: number; lx: number; dof: number; ly: number }>[] = [
  [0.0, { rx: 10, ry: -8, rz: 1, s: 0.62, lx: 288, dof: 0, ly: 1 }],
  [1.6, { rx: 32, ry: -24, rz: 7, s: 1.55, lx: 230, dof: 11, ly: 0 }],
  [3.3, { rx: 30, ry: -20, rz: 5, s: 1.7, lx: 150, dof: 12, ly: 0 }],
  [4.2, { rx: 30, ry: -19, rz: 4.5, s: 1.78, lx: 190, dof: 12, ly: 0 }],
  [4.7, { rx: 30, ry: -18, rz: 4, s: 1.85, lx: 450, dof: 12, ly: 0 }],
  [6.6, { rx: 27, ry: -14, rz: 3, s: 1.8, lx: 210, dof: 12, ly: 0 }],
  [8.2, { rx: 25, ry: -10, rz: 2, s: 1.9, lx: 110, dof: 12, ly: 0 }],
  [10.6, { rx: 20, ry: 20, rz: -5, s: 1.2, lx: 300, dof: 7, ly: 0 }],
  [12.6, { rx: 4, ry: 3, rz: 0, s: 0.86, lx: 288, dof: 0, ly: 1 }],
  [14.0, { rx: 2, ry: 1.5, rz: 0, s: 0.88, lx: 288, dof: 0, ly: 1 }],
]

/** Look point y blends between the live band (ly 0) and the panel centre
    (ly 1), so wide shots frame the whole panel and close ones the action. */
export function cameraAt(t: number) {
  const c = at(CAM, t)
  const ly = c.ly * (panelH(t) / 2) + (1 - c.ly) * liveY(t)
  return { ...c, ly }
}

/** Pointer path: enters, clicks Send, travels to Approve, clicks, leaves.
    Targets are the measured button centres (panel px). */
const PTR: Key<{ x: number; y: number; o: number }>[] = [
  [0.0, { x: 610, y: 430, o: 0 }],
  [3.5, { x: 600, y: 420, o: 0 }],
  [3.9, { x: 590, y: 400, o: 1 }],
  [CLICKS.send - 0.18, { x: 531, y: 292, o: 1 }],
  [CLICKS.send + 0.5, { x: 520, y: 300, o: 1 }],
  [CLICKS.approve - 0.2, { x: 78, y: 384, o: 1 }],
  [CLICKS.approve + 0.7, { x: 150, y: 440, o: 1 }],
  [CLICKS.approve + 1.3, { x: 190, y: 470, o: 0 }],
]
export const pointerAt = (t: number) => pointerFrom(PTR, Object.values(CLICKS), t)
