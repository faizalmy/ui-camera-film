// Composition "UsageFlat": the block alone on a warm near-black (layers 1, 2, 4).
import { useLayoutEffect, useState } from "react"
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion"
import { Pointer } from "../layers/Pointer"
import { UsagePanel, U_W, U_ZOOM } from "./UsagePanel"
import { usagePointer } from "./rig"

const SCALE = 0.8

export function UsageFlat({ measure = false }: { measure?: boolean }) {
  const t = useCurrentFrame() / useVideoConfig().fps
  const [m, setM] = useState("")
  useLayoutEffect(() => {
    if (!measure) return
    const root = document.getElementById("u")
    if (!root) return
    const r0 = root.getBoundingClientRect()
    const k = U_ZOOM * SCALE
    const rel = (el: Element | null | undefined) => {
      if (!el) return null
      const r = el.getBoundingClientRect()
      return [r.x - r0.x, r.y - r0.y, r.width, r.height].map((v) => Math.round(v / k))
    }
    const q = (s: string) => root.querySelector(s)
    const byText = (sel: string, re: RegExp) => [...root.querySelectorAll(sel)].find((e) => re.test(e.textContent ?? ""))
    setM(
      JSON.stringify({
        panel: rel(root),
        thumb: rel(q('[data-slot="slider-thumb"]')),
        track: rel(q('[data-slot="slider-track"]')),
        gemini: rel(byText("label,[role=radio]", /Gemini/)),
        prio: rel(byText("button", /Priority/)),
        zdr: rel(byText("button", /Zero Ret/)),
        sw: rel(q('[data-slot="switch"]')),
        save: rel(byText("button", /Save Plan/)),
        total: rel(byText("p,div,span", /^\$[\d,]+\/mo$/)),
      })
    )
  }, [t, measure])
  return (
    <AbsoluteFill style={{ background: "#161615" }}>
      <div style={{ position: "absolute", left: "50%", top: 180, width: U_W * U_ZOOM, transform: `translateX(-50%) scale(${SCALE})`, transformOrigin: "50% 0" }}>
        <UsagePanel t={t} id="u" />
        <Pointer p={usagePointer(t)} zoom={U_ZOOM} />
      </div>
      {measure ? <div style={{ position: "absolute", left: 10, top: 6, color: "#0f0", font: "20px monospace", width: 1900 }}>{m}</div> : null}
    </AbsoluteFill>
  )
}
