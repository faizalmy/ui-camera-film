// Layer 2: the live UI. The real ReUI block, laid out at ZOOM so text stays
// sharp when the camera pushes in (the 3D plane scales it back down).
import { AgentActivity } from "@/components/blocks/agent-activity-1/components/agent-activity"
import { driveAt } from "../timeline"

export const ZOOM = 2.5
/** Panel width in CSS px before zoom (the block's own max-w-xl). */
export const PANEL_W = 576

export function Panel({ t, id }: { t: number; id?: string }) {
  return (
    <div
      id={id}
      className="video-root freeze text-foreground font-sans antialiased"
      style={{ zoom: ZOOM, width: PANEL_W, ["--clock" as string]: t }}
    >
      <AgentActivity drive={driveAt(t)} />
    </div>
  )
}
