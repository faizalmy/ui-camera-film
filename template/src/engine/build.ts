// Build-in engine: applies Scene.layers to a DOM root as pure functions of t.
// Every touched element is marked (data-build) with its original inline
// values saved, and restored once it lands. Each frame also restores any
// marked element no layer touched (selector edited, element no longer
// matched, scrubbed backwards), so no frame depends on the frames before it.
import { easeInOut, select } from "./dom"
import type { Layer } from "./scene"

const PROPS = ["opacity", "translate", "scale", "clip-path", "transform-origin", "transform"]

function mark(el: HTMLElement) {
  if (el.dataset.build) return
  el.dataset.build = JSON.stringify(Object.fromEntries(PROPS.map((p) => [p, el.style.getPropertyValue(p)])))
}

function restore(el: HTMLElement) {
  if (!el.dataset.build) return
  const orig = JSON.parse(el.dataset.build) as Record<string, string>
  for (const p of PROPS) {
    if (orig[p]) el.style.setProperty(p, orig[p])
    else el.style.removeProperty(p)
  }
  delete el.dataset.build
}

/** The first text node holding a digit: count rewrites only it, so icons and
    other children of the element are never touched. */
function digitNode(el: HTMLElement): Text | null {
  const w = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let n = w.nextNode(); n; n = w.nextNode()) if (/\d/.test(n.nodeValue ?? "")) return n as Text
  return null
}

/** Count: the first number in the text counts up from 0, keeping its format. */
function count(el: HTMLElement, p: number) {
  const node = digitNode(el)
  if (!node) return
  // The original text lives on the element; the node is rewritten from it.
  if (el.dataset.buildText === undefined) el.dataset.buildText = node.nodeValue ?? ""
  const text = el.dataset.buildText
  const m = text.match(/\d[\d,]*(\.\d+)?/)
  if (!m) return
  const dec = m[1] ? m[1].length - 1 : 0
  const value = Number(m[0].replace(/,/g, "")) * p
  const out = value.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: m[0].includes(",") })
  node.nodeValue = text.slice(0, m.index) + out + text.slice((m.index ?? 0) + m[0].length)
}

function uncount(el: HTMLElement) {
  if (el.dataset.buildText === undefined) return
  const node = digitNode(el)
  if (node) node.nodeValue = el.dataset.buildText
  delete el.dataset.buildText
}

/** Roll: odometer digit strips roll from 0, left to right, leading digits
    first. Assumes the common Tailwind odometer markup (NumberFlow-style):
    a `.sr-only` copy of the value and `[aria-hidden] .flex-col` strips, each
    at translateY(-10% * digit). For other markup use "count". */
function roll(num: HTMLElement, t: number, l: Layer, touched: Set<HTMLElement>) {
  const digits = (num.querySelector(".sr-only")?.textContent ?? num.textContent ?? "").replace(/\D/g, "")
  const strips = [...num.querySelectorAll<HTMLElement>("[aria-hidden] .flex-col")]
  strips.forEach((el, i) => {
    const raw = (t - l.at - (l.stagger ?? 0.1) * i) / l.dur
    if (raw >= 1) return
    mark(el)
    touched.add(el)
    el.style.transform = `translateY(${Number(digits[i] ?? 0) * easeInOut(raw) * -10}%)`
  })
}

function one(el: HTMLElement, t: number, start: number, l: Layer, touched: Set<HTMLElement>) {
  const raw = (t - start) / l.dur
  if (raw >= 1) return
  mark(el)
  touched.add(el)
  const p = easeInOut(raw)
  const kind = l.kind ?? "rise"
  if (kind === "rise") {
    el.style.opacity = String(p)
    el.style.translate = `0 ${(1 - p) * (l.dist ?? 14)}px`
  } else if (kind === "tick") {
    el.style.scale = `1 ${p}`
    el.style.transformOrigin = "bottom"
  } else if (kind === "wipe") {
    el.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`
  } else if (kind === "count") {
    count(el, p)
  }
}

export function applyBuild(root: HTMLElement, t: number, layers: Layer[]) {
  const touched = new Set<HTMLElement>()
  for (const l of layers) {
    const els = select(root, l)
    if (l.kind === "roll") {
      for (const el of els) roll(el, t, l, touched)
      continue
    }
    const step = l.spread !== undefined ? l.spread / Math.max(1, els.length - 1) : (l.stagger ?? 0)
    let i = 0
    for (const el of els) {
      const start = l.at + step * i
      if (l.riders && el.matches(l.riders)) {
        one(el, t, start, { ...l, kind: "wipe" }, touched)
        continue
      }
      if (l.children) for (const c of el.children) one(c as HTMLElement, t, start, l, touched)
      else one(el, t, start, l, touched)
      i++
    }
  }
  // Everything marked but not mid-build this frame goes back to its original state.
  for (const el of root.querySelectorAll<HTMLElement>("[data-build]")) {
    if (touched.has(el)) continue
    uncount(el)
    restore(el)
  }
}
