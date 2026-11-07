// Layer 4: the pointer. Lives in panel coordinates so it tilts with the UI,
// the way a screen recording carries its cursor onto the device.
import type { PointerState } from "../rig"

export function Pointer({ p, zoom }: { p: PointerState; zoom: number }) {
  if (p.o <= 0) return null
  const size = 22 * zoom
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 20 28"
      style={{
        position: "absolute",
        left: p.x * zoom,
        top: p.y * zoom,
        opacity: p.o,
        // Tip stays on the target while the body dips on the press.
        transform: `scale(${1 - 0.14 * p.press})`,
        transformOrigin: "2px 2px",
        filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.45))",
        pointerEvents: "none",
      }}
    >
      <path
        d="M2 2 L2 22 L7.2 17.4 L10.6 25.2 L14 23.8 L10.7 16.2 L17.6 16.2 Z"
        fill="#fafafa"
        stroke="#111"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}
