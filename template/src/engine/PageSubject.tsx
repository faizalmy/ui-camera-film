// Any web page as a subject: a static capture (scripts/capture.py) in a
// same-origin iframe, so the engine can build and light its DOM per frame.
// The render holds (delayRender) until the page, its fonts and images are in.
import { useLayoutEffect, useRef, useState } from "react"
import { continueRender, delayRender, staticFile } from "remotion"
import { applyBuild } from "./build"
import { applyWave } from "./wave"
import type { Scene } from "./scene"

export function PageSubject({ src, width, height, t, scene }: { src: string; width: number; height: number; t: number; scene: Scene }) {
  const ref = useRef<HTMLIFrameElement>(null)
  const [doc, setDoc] = useState<Document | null>(null)
  const [hold] = useState(() => delayRender(`page ${src}`, { timeoutInMilliseconds: 60000 }))

  const onLoad = async () => {
    const d = ref.current?.contentDocument
    if (!d) return
    await d.fonts.ready
    await Promise.all([...d.images].map((i) => i.decode().catch(() => undefined)))
    // The light-wave layer lives inside the page, in its own coordinates.
    const layer = d.createElement("div")
    layer.setAttribute("data-wave", "")
    layer.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:2147483647"
    d.body.appendChild(layer)
    setDoc(d)
    continueRender(hold)
  }

  useLayoutEffect(() => {
    if (!doc) return
    const root = doc.body
    applyBuild(root, t, scene.layers)
    const layer = root.querySelector<HTMLElement>(":scope > [data-wave]")
    if (layer) applyWave(root, layer, t, scene.sweeps)
  })

  return <iframe ref={ref} src={staticFile(src)} onLoad={onLoad} scrolling="no" style={{ width, height, border: 0, display: "block" }} />
}
