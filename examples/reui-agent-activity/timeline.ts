// Layer 1 data: the story. Every value on screen is a pure function of the
// time t (seconds), so any frame renders the same on any worker.
import type { AgentActivityDrive } from "@/components/blocks/agent-activity-1/components/agent-activity"
import { RUN } from "@/components/blocks/agent-activity-1/components/data"

export const FPS = 60
export const DURATION_S = 14
export const W = 1920
export const H = 1440

/** One span per step the run passes through. `at` is the block's step index. */
const SPANS: { at: number; start: number; end: number }[] = [
  { at: 2, start: 0.0, end: 1.3 }, // s03 reading the docs
  { at: 3, start: 1.3, end: 2.7 }, // s04 reproducing the 500
  { at: 4, start: 2.7, end: 4.9 }, // s05 needs your answer (typed + Send)
  { at: 5, start: 4.9, end: 6.4 }, // s06 editing the branch
  { at: 6, start: 6.4, end: 8.0 }, // s07 needs your approval (Approve)
  { at: 7, start: 8.0, end: 9.5 }, // s08 scale_app, times out
  { at: 8, start: 9.5, end: 10.7 }, // s09 retry lands
  { at: 9, start: 10.7, end: 11.7 }, // s10 opens the issue
  { at: 10, start: 11.7, end: DURATION_S }, // run complete
]

export const ANSWER = "Fix both branches"
export const TYPE_FROM = 3.3
export const TYPE_TO = 4.35
/** The two clicks; each lands just before its decision. */
export const CLICKS = { send: 4.85, approve: 7.95 }

const clamp = (v: number) => Math.min(1, Math.max(0, v))

export function driveAt(t: number): AgentActivityDrive {
  const span = [...SPANS].reverse().find((s) => t >= s.start) ?? SPANS[0]
  const step = RUN[span.at]
  const local = t - span.start
  const decisions: AgentActivityDrive["decisions"] = {}
  if (t >= SPANS[3].start) decisions.s05 = { decision: "answered", note: ANSWER }
  if (t >= SPANS[5].start) decisions.s07 = { decision: "approved" }
  const typed = Math.floor(clamp((t - TYPE_FROM) / (TYPE_TO - TYPE_FROM)) * ANSWER.length)
  return {
    at: span.at,
    // Fractional, so the bar and its percent count every frame instead of
    // jumping once per declared second.
    elapsed: step && step.seconds > 0 ? clamp(local / (span.end - span.start)) * step.seconds : 0,
    decisions,
    draft: span.at === 4 ? ANSWER.slice(0, typed) : "",
    enter: clamp(local / 0.3),
  }
}
