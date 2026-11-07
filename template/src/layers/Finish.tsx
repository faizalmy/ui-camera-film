// Layers 6-7: the lens finish. Grain textures the background only (never over
// text); the vignette darkens the frame edges like the reference's black bay.
import { useId } from "react"
import { AbsoluteFill } from "remotion"

export function Grain({ frame, opacity = 0.07 }: { frame: number; opacity?: number }) {
  const id = useId().replace(/:/g, "")
  // New noise every 2 frames (30 Hz), deterministic per frame.
  const seed = Math.floor(frame / 2) % 97
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  )
}

export function Vignette({ strength }: { strength: number }) {
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        background: `radial-gradient(ellipse 72% 70% at 50% 50%, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.55 * strength}) 78%, rgba(0,0,0,${0.92 * strength}) 100%)`,
      }}
    />
  )
}
