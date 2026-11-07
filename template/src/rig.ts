// Camera and pointer helpers, generic over any subject. Positions are in the
// subject's own layout px (before zoom), keyed by seconds, eased between keys.
import { Easing, interpolate } from "remotion"

export const EASE = Easing.bezier(0.45, 0, 0.2, 1)

export type Key<T> = [number, T]

/** Eased value between the two keys around t. */
export function at<T extends Record<string, number>>(keys: Key<T>[], t: number): T {
  const i = keys.findIndex(([k]) => k > t)
  if (i === -1) return keys[keys.length - 1][1]
  if (i === 0) return keys[0][1]
  const [t0, a] = keys[i - 1]
  const [t1, b] = keys[i]
  const p = EASE((t - t0) / (t1 - t0))
  const out = {} as T
  for (const k in a) out[k] = (a[k] + (b[k] - a[k]) * p) as T[typeof k]
  return out
}

export function track(keys: Key<{ y: number }>[], t: number) {
  let y = keys[0][1].y
  for (let i = 1; i < keys.length; i++) {
    const [k, v] = keys[i]
    y += (v.y - keys[i - 1][1].y) * EASE(Math.min(1, Math.max(0, (t - k) / 0.5)))
  }
  return y
}
export type PointerState = { x: number; y: number; o: number; press: number }

/** Eased path plus a press dip at each click time (a hold keeps it down). */
export function pointerFrom(keys: Key<{ x: number; y: number; o: number }>[], clicks: number[], t: number, holds: [number, number][] = []): PointerState {
  const p = at(keys, t)
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const
  const press = Math.max(
    0,
    ...clicks.map((c) => interpolate(t, [c - 0.06, c, c + 0.12], [0, 1, 0], clamp)),
    ...holds.map(([a, b]) => interpolate(t, [a - 0.06, a, b, b + 0.1], [0, 1, 1, 0], clamp))
  )
  return { ...p, press }
}

/** Reference v1 is cut, not swept: each shot holds one framing and drifts
    slowly from a to b (sine in-out), and shots meet on hard cuts. */
export type CamKey = { rx: number; ry: number; rz: number; s: number; lx: number; ly: number; dof: number }
export type Shot = { from: number; to: number; a: CamKey; b: CamKey }
export function shotAt(shots: Shot[], t: number): CamKey {
  const s = shots.find((x) => t >= x.from && t < x.to) ?? shots[shots.length - 1]
  const p = Math.min(1, Math.max(0, (t - s.from) / (s.to - s.from)))
  const e = 0.5 - 0.5 * Math.cos(Math.PI * p)
  const out = {} as CamKey
  for (const k in s.a) out[k as keyof CamKey] = s.a[k as keyof CamKey] + (s.b[k as keyof CamKey] - s.a[k as keyof CamKey]) * e
  return out
}
/** Pointer key helper: arrive `lead` s before a click, hold `hold` s after it. */
export function clickKeys(t: number, p: { x: number; y: number }, lead = 0.45, hold = 0.35): Key<{ x: number; y: number; o: number }>[] {
  return [
    [t - lead, { ...p, o: 1 }],
    [t + hold, { ...p, o: 1 }],
  ]
}

/** Exposure per shot: each shot lifts from near-black over `lift` s, and the
    film sits at `level` (the reference reads dark, mean luma 9-15 of 255). */
export function shotFade(shots: Shot[], t: number, level = 0.8, lift = 0.35) {
  const shot = shots.find((x) => t >= x.from && t < x.to) ?? shots[shots.length - 1]
  const k = Math.min(1, (t - shot.from) / lift)
  return level * (0.08 + 0.92 * (1 - Math.pow(1 - k, 2)))
}
