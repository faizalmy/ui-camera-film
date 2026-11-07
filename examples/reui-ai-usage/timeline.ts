// Layer 1 for ai-usage-1: the plan state for any second.
// Story: drag volume up until the cap goes red, then win it back: cheaper
// model, drop Long Context, add Code Interpreter, annual commit, Save Plan.
import type { AiUsageDrive } from "@/components/blocks/ai-usage-1/components/ai-usage"
import { EASE } from "../rig"

export const U_DURATION_S = 31

/** Ruler steps: 220M (default, step 47) dragged to 2B (step 66), the -30% tier. */
export const STEP_FROM = 47
export const STEP_TO = 66
export const DRAG = { from: 11.3, to: 13.7 }
export const CLICKS = { model: 15.2, context: 17.6, interpreter: 18.8, annual: 21.2, save: 24.4 }

/** Clicks whose block transitions play (seeked per frame). */
export const EVENTS = [CLICKS.model, CLICKS.context, CLICKS.interpreter, CLICKS.annual]
/** Longest block transition (odometer, 250 ms) plus margin. */
export const TX_WINDOW = 0.4

export const dragP = (t: number) => EASE(Math.min(1, Math.max(0, (t - DRAG.from) / (DRAG.to - DRAG.from))))

export function driveUsage(t: number): AiUsageDrive {
  const addons: AiUsageDrive["addons"] = ["search"]
  if (t >= CLICKS.interpreter) addons.push("interpreter")
  if (t < CLICKS.context) addons.push("context")
  return {
    step: Math.round(STEP_FROM + (STEP_TO - STEP_FROM) * dragP(t)),
    model: t >= CLICKS.model ? "gpt-5-1-mini" : "sonnet-5",
    addons,
    annual: t >= CLICKS.annual,
  }
}

const stepAt = (t: number) => Math.round(STEP_FROM + (STEP_TO - STEP_FROM) * dragP(t))

/** The latest state change at or before t whose transitions are still
    playing: a click, or a ruler step landing during the drag (each step is an
    event, so the total, chart and ticks glide through the whole drag). */
export function liveEvent(t: number) {
  let latest: number | undefined
  for (const e of EVENTS) if (t >= e && t - e < TX_WINDOW) latest = e
  if (t >= DRAG.from && t <= DRAG.to + TX_WINDOW) {
    const now = stepAt(t)
    // Walk back at 1/240 s to the moment this step landed.
    let k = t
    while (k > DRAG.from && stepAt(k - 1 / 240) === now) k -= 1 / 240
    if (k > DRAG.from && t - k < TX_WINDOW && (latest === undefined || k > latest)) latest = k
  }
  return latest
}
