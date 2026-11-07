// Composition "PageCamera": any captured web page through the camera rig.
import { useCurrentFrame, useVideoConfig } from "remotion"
import { CameraRig } from "../CameraRig"
import { PageSubject } from "../engine/PageSubject"
import { pointerFrom, shotAt, shotFade, type Key, type Shot } from "../rig"
import { CLICKS, PAGE, PAGE_SCENE } from "./scene"

/** Layout zoom: the page is drawn at 1.5x so text stays sharp up close. */
const ZOOM = 1.5

// Shots in page px (lx, ly). Wide, hero zoom, toolbar zoom (pans across), tilted wide.
const SHOTS: Shot[] = [
  { from: 0.0, to: 2.4, a: { rx: 6, ry: -5, rz: 0.5, s: 0.72, lx: 720, ly: 450, dof: 0 }, b: { rx: 5, ry: -4, rz: 0.4, s: 0.75, lx: 720, ly: 445, dof: 0 } },
  { from: 2.4, to: 7.0, a: { rx: 20, ry: -12, rz: 2.5, s: 1.3, lx: 720, ly: 240, dof: 5 }, b: { rx: 18, ry: -9, rz: 2, s: 1.36, lx: 720, ly: 330, dof: 5 } },
  { from: 7.0, to: 11.6, a: { rx: 24, ry: 14, rz: -3, s: 1.55, lx: 360, ly: 566, dof: 6 }, b: { rx: 22, ry: 11, rz: -2.4, s: 1.6, lx: 1120, ly: 566, dof: 6 } },
  { from: 11.6, to: 14.0, a: { rx: 30, ry: -20, rz: 6, s: 0.92, lx: 720, ly: 420, dof: 3 }, b: { rx: 28, ry: -17, rz: 5, s: 0.95, lx: 700, ly: 400, dof: 3 } },
]

// Pointer in page px: into the hero, click Watch Intro, then Customize.
const PTR: Key<{ x: number; y: number; o: number }>[] = [
  [0, { x: 760, y: 520, o: 0 }],
  [4.5, { x: 760, y: 520, o: 0 }],
  [4.8, { x: 720, y: 480, o: 1 }],
  [CLICKS.intro - 0.45, { x: 640, y: 432, o: 1 }],
  [CLICKS.intro + 0.35, { x: 640, y: 432, o: 1 }],
  [7.2, { x: 900, y: 640, o: 1 }],
  [CLICKS.customize - 0.6, { x: 1330, y: 566, o: 1 }],
  [CLICKS.customize + 0.4, { x: 1330, y: 566, o: 1 }],
  [11.4, { x: 1360, y: 610, o: 0 }],
]

export function PageCamera() {
  const frame = useCurrentFrame()
  const t = frame / useVideoConfig().fps
  return (
    <CameraRig
      frame={frame}
      cam={shotAt(SHOTS, t)}
      width={PAGE.width}
      zoom={ZOOM}
      radius={16 * ZOOM}
      fade={shotFade(SHOTS, t)}
      focusScale={1.6}
      panel={() => (
        <div style={{ zoom: ZOOM, borderRadius: 16, overflow: "hidden" }}>
          <PageSubject src={PAGE.src} width={PAGE.width} height={PAGE.height} t={t} scene={PAGE_SCENE} />
        </div>
      )}
      pointer={pointerFrom(PTR, Object.values(CLICKS), t)}
    />
  )
}
