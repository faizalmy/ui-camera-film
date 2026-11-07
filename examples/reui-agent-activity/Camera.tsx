// Composition "Camera": agent-activity-1 through the generic camera rig.
import { useCurrentFrame, useVideoConfig } from "remotion"
import { CameraRig } from "./CameraRig"
import { cameraAt, pointerAt } from "./rig"
import { Panel, PANEL_W, ZOOM } from "./layers/Panel"

export function Camera() {
  const frame = useCurrentFrame()
  const t = frame / useVideoConfig().fps
  return (
    <CameraRig
      frame={frame}
      cam={cameraAt(t)}
      width={PANEL_W}
      zoom={ZOOM}
      radius={14 * ZOOM}
      panel={() => <Panel t={t} />}
      pointer={pointerAt(t)}
    />
  )
}
