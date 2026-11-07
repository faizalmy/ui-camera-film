// Light-wave engine: applies Scene.sweeps to a DOM root. A soft band of warm
// light crosses a region, sine eased, and lights the outlines it passes.
// Rings are border-only overlays (mask exclude) whose gradient lives in root
// coordinates, so one band reads as one front across several outlines.
// `layer` is an absolutely positioned, pointer-events-none child of root.
import { building, easeSine, offsetIn, rand, select } from "./dom"
import type { Sweep } from "./scene"

const LIGHT = "255,246,232"
const DARK = "40,32,24"

function ring(el: HTMLElement, root: HTMLElement, c: number, band: number, a: number, w0: number, h0: number) {
  const { x, y } = offsetIn(el, root)
  const w = el.offsetWidth
  const h = el.offsetHeight
  if (x + w < c - band * 1.6 || x > c + band * 1.6) return ""
  const cs = getComputedStyle(el)
  const r = cs.borderRadius
  // On a light fill a warm ring is invisible: light it with a dark tone instead.
  const rgb = (cs.backgroundColor.match(/[\d.]+/g) ?? []).map(Number)
  const lum = rgb.length >= 3 && (rgb[3] ?? 1) > 0.5 ? (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255 : 0
  const tone = lum > 0.6 ? DARK : LIGHT
  const g = `linear-gradient(100deg, rgba(${tone},0) ${c - band}px, rgba(${tone},${a}) ${c}px, rgba(${tone},0) ${c + band}px)`
  return (
    `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;box-sizing:border-box;border-radius:${r};` +
    `border:1.5px solid transparent;background:${g} border-box;background-size:${w0}px ${h0}px;background-position:${-x}px ${-y}px;` +
    `-webkit-mask:linear-gradient(#000 0 0) padding-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude"></div>`
  )
}

export function applyWave(root: HTMLElement, layer: HTMLElement, t: number, sweeps: Sweep[]) {
  const live = sweeps.filter((s) => t >= s.from && t <= s.to)
  if (!live.length) {
    if (layer.childElementCount) layer.replaceChildren()
    return
  }
  const w0 = root.offsetWidth
  // scrollHeight: a body with collapsed height still spans its content.
  const h0 = Math.max(root.offsetHeight, root.scrollHeight)
  const rings: string[] = []
  for (const s of live) {
    const p = (t - s.from) / (s.to - s.from)
    const a = 0.8 * Math.min(1, p / 0.2, (1 - p) / 0.2)
    const els: HTMLElement[] = []
    let n = 0
    for (const pick of s.picks) {
      for (const el of select(root, pick)) {
        n++
        if (s.seed !== undefined && !pick.always && rand(s.seed, n) > (s.keep ?? 1)) continue
        if (!el.closest("[data-wave]") && !building(el, root)) els.push(el)
      }
    }
    if (!els.length) continue
    let x0 = s.x0
    let x1 = s.x1
    if (x0 === undefined || x1 === undefined) {
      x0 = offsetIn(els[0], root).x
      x1 = x0 + els[0].offsetWidth
    }
    const band = s.x0 === undefined ? Math.max(50, (x1 - x0) * 0.4) : 170
    const c = x0 - band + (x1 - x0 + band * 2) * easeSine(p)
    for (const el of els) rings.push(ring(el, root, c, band, a, w0, h0))
  }
  layer.innerHTML = rings.join("")
}
