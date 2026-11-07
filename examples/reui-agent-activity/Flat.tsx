// Composition "Flat": layers 1, 2 and 4 only. The UI recording the reference
// posts beside its camera shot: panel top-anchored on a warm near-black.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion"
import { Panel, PANEL_W, ZOOM } from "./layers/Panel"
import { Pointer } from "./layers/Pointer"
import { pointerAt } from "./rig"

const SCALE = 0.6

export function Flat() {
  const t = useCurrentFrame() / useVideoConfig().fps
  return (
    <AbsoluteFill style={{ background: "#161615" }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 300,
          width: PANEL_W * ZOOM,
          transform: `translateX(-50%) scale(${SCALE})`,
          transformOrigin: "50% 0",
        }}
      >
        <Panel t={t} />
        <Pointer p={pointerAt(t)} zoom={ZOOM} />
      </div>
    </AbsoluteFill>
  )
}
