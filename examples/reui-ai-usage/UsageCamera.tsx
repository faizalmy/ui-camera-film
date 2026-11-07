// Composition "UsageCamera": ai-usage-1 through the generic camera rig.
import { useCurrentFrame, useVideoConfig } from "remotion"
import { CameraRig } from "../CameraRig"
import { usageCam, usageFade, usagePointer } from "./rig"
import { UsagePanel, U_W, U_ZOOM } from "./UsagePanel"

export function UsageCamera() {
  const frame = useCurrentFrame()
  const t = frame / useVideoConfig().fps
  return (
    <CameraRig
      frame={frame}
      cam={usageCam(t)}
      width={U_W}
      zoom={U_ZOOM}
      radius={14 * U_ZOOM}
      slab={false}
      fade={usageFade(t)}
      focusScale={1.6}
      panel={() => <UsagePanel t={t} />}
      pointer={usagePointer(t)}
    />
  )
}
