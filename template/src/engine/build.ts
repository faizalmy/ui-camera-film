// Build-in engine: applies Scene.layers to a DOM root as pure functions of t.
// Every touched element is marked (data-build) and restored once it lands, so
// the subject's own styles and transitions take over afterwards.
import { easeInOut, select } from "./dom"
import type { Layer } from "./scene"

const PROPS = ["opacity", "translate", "scale", "clip-path", "transform-origin"]

function restore(el: HTMLElement) {
  if (!el.dataset.build) return
  for (const p of PROPS) el.style.removeProperty(p)
  if (el.dataset.buildText !== undefined) {
    el.textContent = el.dataset.buildText
    delete el.dataset.buildText
  }
  delete el.dataset.build
}

/** Count: the first number in the text counts up from 0, keeping its format. */
function count(el: HTMLElement, p: number) {
  if (el.dataset.buildText === undefined) el.dataset.buildText = el.textContent ?? ""
  const text = el.dataset.buildText
  const m = text.match(/\d[\d,]*(\.\d+)?/)
  if (!m) return
  const dec = m[1] ? m[1].length - 1 : 0
  const value = Number(m[0].replace(/,/g, "")) * p
  const out = value.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: m[0].includes(",") })
  el.textContent = text.slice(0, m.index) + out + text.slice((m.index ?? 0) + m[0].length)
}

/** Roll: odometer digit strips (each strip translateY(-10% * digit)) roll from
    0, left to right, so the leading digits settle first. Digits come from the
    number's text (first .sr-only child, else its textContent). */
function roll(num: HTMLElement, t: number, l: Layer) {
  const digits = (num.querySelector(".sr-only")?.textContent ?? num.textContent ?? "").replace(/\D/g, "")
  const strips = [...num.querySelectorAll<HTMLElement>("[aria-hidden] .flex-col")]
  strips.forEach((el, i) => {
    const raw = (t - l.at - (l.stagger ?? 0.1) * i) / l.dur
    const d = Number(digits[i] ?? 0)
    if (raw >= 1) {
      if (el.dataset.build) {
        el.style.transform = `translateY(${d * -10}%)`
        delete el.dataset.build
      }
      return
    }
    el.dataset.build = "1"
    el.style.transform = `translateY(${d * easeInOut(raw) * -10}%)`
  })
}

function one(el: HTMLElement, t: number, start: number, l: Layer) {
  const raw = (t - start) / l.dur
  if (raw >= 1) return restore(el)
  el.dataset.build = "1"
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
  for (const l of layers) {
    const els = select(root, l)
    if (l.kind === "roll") {
      for (const el of els) roll(el, t, l)
      continue
    }
    const step = l.spread !== undefined ? l.spread / Math.max(1, els.length - 1) : (l.stagger ?? 0)
    let i = 0
    for (const el of els) {
      const start = l.at + step * i
      if (l.riders && el.matches(l.riders)) {
        one(el, t, start, { ...l, kind: "wipe" })
        continue
      }
      if (l.children) for (const c of el.children) one(c as HTMLElement, t, start, l)
      else one(el, t, start, l)
      i++
    }
  }
}
