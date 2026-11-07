// Layer 2 for ai-usage-1: the real block, laid out at ZOOM for sharp text,
// with its own CSS transitions played back deterministically.
//
// Two-phase commit per frame inside an event's window:
//   1. render the state from just before the event with transitions frozen,
//      force a style flush (that is the "from" value);
//   2. unfreeze and render the current state: the block's own transitions
//      start (odometer digits, chart, ticks, colours);
//   3. pause each CSSTransition and seek it to (t - event).
// The result never depends on which frame this tab rendered before.
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { continueRender, delayRender } from "remotion"
import { AiUsage } from "@/components/blocks/ai-usage-1/components/ai-usage"
import { applyBuild } from "../engine/build"
import { applyWave } from "../engine/wave"
import { USAGE_SCENE } from "./scene"
import { driveUsage, liveEvent } from "./timeline"

export const U_ZOOM = 2
/** The block's own max-w-5xl; wide enough for its two-column layout. */
export const U_W = 1024

export function UsagePanel({ t, id }: { t: number; id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const waveRef = useRef<HTMLDivElement>(null)
  const ev = liveEvent(t)
  const [armedFor, setArmedFor] = useState<number | null>(null)
  const before = ev !== undefined && armedFor !== t

  // The block's avatar loads from the network and swaps in from its fallback
  // when ready. Hold the render until it has, so no frame shows the initials.
  const [hold] = useState(() => delayRender("avatar image"))
  useEffect(() => {
    let raf = 0
    const started = performance.now()
    const check = () => {
      const img = ref.current?.querySelector<HTMLImageElement>('[data-slot="avatar-image"]')
      if ((img && img.complete) || performance.now() - started > 8000) continueRender(hold)
      else raf = requestAnimationFrame(check)
    }
    check()
    return () => cancelAnimationFrame(raf)
  }, [hold])

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const finish = () => {
      applyBuild(root, t, USAGE_SCENE.layers)
      if (waveRef.current) applyWave(root, waveRef.current, t, USAGE_SCENE.sweeps)
    }
    if (ev === undefined) {
      finish()
      return
    }
    void root.offsetHeight // flush style: phase 1 values, or start phase 2 transitions
    if (before) {
      setArmedFor(t)
      return
    }
    const all = root.getAnimations({ subtree: true })
    for (const a of all) {
      if ("transitionProperty" in a) {
        a.pause()
        a.currentTime = (t - ev) * 1000
      }
    }
    finish()
  })

  return (
    <div
      ref={ref}
      id={id}
      className={`video-root text-foreground font-sans antialiased${ev === undefined || before ? " freeze" : ""}`}
      style={{ zoom: U_ZOOM, width: U_W, position: "relative", ["--clock" as string]: t }}
    >
      <AiUsage drive={driveUsage(before && ev !== undefined ? ev - 1e-3 : t)} />
      {/* Light-wave outline rings, filled imperatively by applyWave. */}
      <div ref={waveRef} data-wave="" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
    </div>
  )
}
