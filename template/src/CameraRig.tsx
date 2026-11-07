// The Ultramock camera, generic over any panel.
//   0 background   near-black bay + grain (grain never over the UI)
//   3 camera       one 3D plane: perspective + rotate + scale about a look point
//   3a slab        stacked layers behind the panel = device thickness
//   3b dof         blurred copy under a sharp copy masked to the focus point
//   4 pointer      inside the plane, so it tilts with the UI
//   5 vignette     darkens the bay toward the frame edge
import type { ReactNode } from "react"
import { AbsoluteFill } from "remotion"
import type { PointerState } from "./rig"
import { Pointer } from "./layers/Pointer"
import { Grain, Vignette } from "./layers/Finish"

export type Cam = { rx: number; ry: number; rz: number; s: number; lx: number; ly: number; dof: number }

const PERSPECTIVE = 2400
const SLAB_LAYERS = 9
const SLAB_STEP = 3

function Slab({ radius }: { radius: number }) {
  return (
    <>
      {Array.from({ length: SLAB_LAYERS }, (_, i) => {
        const k = i / (SLAB_LAYERS - 1)
        // Lit near the face, falling to black at the back, like an aluminium lip.
        const v = Math.round(30 - 22 * k)
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: -2,
              borderRadius: radius + 2,
              background: `rgb(${v},${v},${v - 1})`,
              transform: `translateZ(${-(i + 1) * SLAB_STEP}px)`,
              boxShadow: i === 0 ? "inset 0 1px 0 rgba(255,255,255,0.10)" : undefined,
            }}
          />
        )
      })}
    </>
  )
}

export function CameraRig({
  frame,
  cam: c,
  width,
  zoom,
  radius,
  panel,
  pointer,
  slab = true,
  fade = 1,
  focusScale = 1,
}: {
  frame: number
  cam: Cam
  /** Panel width in CSS px before zoom. */
  width: number
  zoom: number
  /** Outer corner radius of the panel at zoom, for the plate and slab. */
  radius: number
  /** Renders the panel; called once per copy, so it must be pure. */
  panel: () => ReactNode
  pointer: PointerState
  /** Off for multi-card blocks, where one slab would read as a backboard. */
  slab?: boolean
  /** 0..1 exposure, for the reference's lift from dim at the open. */
  fade?: number
  /** Size of the sharp area; above 1 the in-focus region grows. */
  focusScale?: number
}) {
  const fx = c.lx * zoom
  const fy = c.ly * zoom
  // Shallower focus the closer the camera sits, like a real lens.
  const k = Math.max(c.s, 0.8)
  const fs = focusScale
  const dof = c.dof > 0.05
  const focus = `radial-gradient(ellipse ${(980 * fs) / k}px ${(300 * fs) / k}px at ${fx}px ${fy}px, #000 ${fs > 1 ? 55 : 42}%, transparent 100%)`
  // The panel's own fill can be translucent (ReUI Frame is bg-muted/50), so each
  // copy sits on the same opaque plate; otherwise the blur glows through.
  // With no slab the plate is the bay colour, so the gap between cards reads as bay.
  const plate = slab ? { background: "rgb(30,30,29)", borderRadius: radius } : { background: "#050505" }

  return (
    <AbsoluteFill style={{ background: "#050505" }}>
      <Grain frame={frame} opacity={0.09} />
      <AbsoluteFill style={{ perspective: PERSPECTIVE }}>
        <div style={{ position: "absolute", left: "50%", top: "50%", transformStyle: "preserve-3d" }}>
          <div
            style={{
              position: "relative",
              width: width * zoom,
              transformOrigin: "0 0",
              transformStyle: "preserve-3d",
              transform: `rotateX(${c.rx}deg) rotateY(${c.ry}deg) rotateZ(${c.rz}deg) scale(${c.s}) translate(${-fx}px, ${-fy}px)`,
            }}
          >
            {slab ? <Slab radius={radius} /> : null}
            {/* Always two copies, so a cut between sharp and shallow focus never
                remounts the panel (an iframe subject would reload). */}
            <div style={{ ...plate, filter: dof ? `blur(${c.dof}px) brightness(${1 - 0.025 * c.dof})` : undefined }}>{panel()}</div>
            <div style={{ ...plate, position: "absolute", inset: 0, maskImage: dof ? focus : undefined, WebkitMaskImage: dof ? focus : undefined }}>{panel()}</div>
            <div style={{ position: "absolute", inset: 0 }}>
              <Pointer p={pointer} zoom={zoom} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.95} />
      {fade < 1 ? <AbsoluteFill style={{ background: "#000", opacity: 1 - fade }} /> : null}
    </AbsoluteFill>
  )
}

