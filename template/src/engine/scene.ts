// A scene is the whole choreography for one subject, as data: which DOM
// layers build in when, and where light waves cross the outlines. The engine
// (build.ts, wave.ts) applies it to any DOM root as pure functions of t, so
// the same config drives a React component or a captured web page.

/** Where to look: every match of `sel` under the root, or under the
    `nth` match of `scope`. `sel: ":scope"` means the scope element itself.
    `index` keeps only that one match. */
export type Target = { sel: string; scope?: string; nth?: number; index?: number }

export type Kind =
  | "rise" // fade up from `dist` px below
  | "tick" // grow from the bottom edge (bars, ticks)
  | "wipe" // reveal left to right (charts, rules, progress)
  | "count" // the first number in the text counts up from 0 (any page)
  | "roll" // odometer: digit strips (translateY -10% per digit) roll from 0

export type Layer = Target & {
  /** Start, seconds. */
  at: number
  /** Duration per element, seconds. */
  dur: number
  kind?: Kind
  /** Rise distance, px. */
  dist?: number
  /** Delay between matches (for "roll": between digits), seconds. */
  stagger?: number
  /** Total delay spread over all matches (overrides stagger). */
  spread?: number
  /** Animate each match's children instead (for nodes that own their own
      inline opacity, e.g. motion/AnimatePresence items). */
  children?: boolean
  /** Matches of this selector (e.g. separators) take no stagger slot: they
      wipe in with the match after them. */
  riders?: string
}

export type Pick = Target & {
  /** Never dropped by the random subset (use for card panels). */
  always?: boolean
}

/** A soft band of light crossing x0..x1 (root px) left to right between
    from and to, lighting the outlines of the picked elements as it passes.
    With seed + keep, only a seeded random share of the picks light up.
    Without x0/x1 the band crosses the first picked element only. */
export type Sweep = {
  from: number
  to: number
  picks: Pick[]
  x0?: number
  x1?: number
  seed?: number
  keep?: number
}

export type Scene = { layers: Layer[]; sweeps: Sweep[] }

/** A click wave: a short sweep across just the pressed element. */
export const clickSweep = (at: number, pick: Pick, dur = 1.4): Sweep => ({ from: at - 0.05, to: at - 0.05 + dur, picks: [pick] })
