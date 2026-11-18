// Generic chart motion for any card: numbers count, progress wipes, tick rows
// fill, lines draw, area fills wipe, bars grow, pie/radial slices land one by
// one, dots land last. Selectors cover Recharts (shadcn/ReUI charts) and shadcn
// progress; parts a card does not have are skipped without a warning.
import type { Layer, Target } from "./scene"

type Opts = {
  /** Build time for the whole chart, seconds. */
  dur?: number
  /** Delay between lines (numbers spread over half of `dur`, however many), seconds. */
  step?: number
  /** Count every `.tabular-nums` value in the card (off for cards whose numbers should hold). */
  numbers?: boolean
  /** Small parts too: line icons draw, separators wipe, list/table rows rise, then badges, avatars,
      controls, and the delta beside each number once it has counted. */
  details?: boolean
}

/** Layers that bring every chart in `card` to life from `at`. `card` is a Target
    whose `sel` is the card itself (e.g. { sel: '[data-slot="frame"]', index: 2 }). */
export function chartLayers(card: Target, at: number, { dur = 1.6, step = 0.25, numbers = true, details = true }: Opts = {}): Layer[] {
  const scope = { scope: card.sel, nth: card.index ?? card.nth ?? 0, optional: true }
  const L = (sel: string, l: Omit<Layer, keyof Target>): Layer => ({ ...scope, sel, ...l })
  const out: Layer[] = [
    L('[data-slot="progress-indicator"], [role="progressbar"] > div', { kind: "wipe", at, dur }),
    L('[role="img"] > span', { kind: "grow", at, dur: 0.35, spread: dur }),
    L("path.recharts-area-area", { kind: "wipe", at, dur, stagger: step }),
    L("path.recharts-line-curve, path.recharts-area-curve", { kind: "draw", at, dur, stagger: step }),
    L(".recharts-bar-rectangle .recharts-rectangle", { kind: "grow", at, dur: 0.6, spread: Math.max(0, dur - 0.6) }),
    L(".recharts-pie-sector, .recharts-radial-bar-sector", { at, dur: 0.5, spread: Math.max(0, dur - 0.5), dist: 0 }),
    L(".recharts-line-dots > *, .recharts-area-dots > *", { at: at + dur, dur: 0.4, spread: 0.3, dist: 0 }),
  ]
  // Outermost tabular figures only, so a value nested in another never counts twice.
  if (numbers) out.unshift(L(".tabular-nums:not(.tabular-nums .tabular-nums)", { kind: "count", at, dur, spread: dur / 2 }))
  if (details) {
    const d = at + dur * 0.3
    out.push(
      L("svg.lucide > *", { kind: "draw", at, dur: dur * 0.6, spread: dur * 0.5 }),
      L('[data-slot="separator"]', { kind: "wipe", at: d, dur: dur * 0.5, spread: dur * 0.3 }),
      L('[data-slot="tabs-trigger"], [data-slot="select-trigger"], [data-slot="button"]', { at, dur: 0.6, spread: dur * 0.3, dist: 4 }),
      L("li, tbody tr", { at: d, dur: 0.7, spread: dur * 0.6, dist: 8 }),
      L('[data-slot="badge"]:not(li [data-slot="badge"], tr [data-slot="badge"])', { at: d + dur * 0.3, dur: 0.6, spread: dur * 0.4, dist: 6 }),
      L('[data-slot="avatar"]', { at: d + dur * 0.4, dur: 0.5, spread: dur * 0.3, dist: 6 }),
      L(".tabular-nums + span", { at: at + dur * 0.8, dur: 0.6, spread: dur * 0.3, dist: 6 }),
    )
  }
  return out
}
