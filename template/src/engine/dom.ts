import type { Target } from "./scene"

/** Ease in and out (cubic): no snap at either end. */
export const easeInOut = (x: number) => {
  const c = Math.min(1, Math.max(0, x))
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

/** Sine in-out: steady travel for light bands. */
export const easeSine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)))

/** Deterministic 0..1 per (seed, n): the same "random" pick every render. */
export const rand = (seed: number, n: number) => {
  const v = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453
  return v - Math.floor(v)
}

export function select(root: HTMLElement, tg: Target): HTMLElement[] {
  let base: Element | undefined = root
  if (tg.scope) base = root.querySelectorAll(tg.scope)[tg.nth ?? 0]
  if (!base) return []
  const all = tg.sel === ":scope" ? [base as HTMLElement] : [...base.querySelectorAll<HTMLElement>(tg.sel)]
  return tg.index === undefined ? all : all.slice(tg.index, tg.index + 1)
}

/** Layout position inside root (offsetLeft/Top), untouched by CSS transforms,
    so a 3D camera or a build translate never moves it. */
export function offsetIn(el: HTMLElement, root: HTMLElement) {
  let x = 0
  let y = 0
  let n: HTMLElement | null = el
  while (n && n !== root) {
    x += n.offsetLeft
    y += n.offsetTop
    n = n.offsetParent as HTMLElement | null
  }
  return { x, y }
}

/** True while it, or a parent, is still mid build-in. */
export function building(el: HTMLElement, root: HTMLElement) {
  for (let n: HTMLElement | null = el; n && n !== root; n = n.parentElement) if (n.dataset.build) return true
  return false
}
