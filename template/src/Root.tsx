import "./video.css"
import { Composition } from "remotion"
import { PageCamera } from "./page/PageCamera"
import { PAGE_DURATION_S } from "./page/scene"

export const FPS = 60
export const W = 1920
export const H = 1440

export function Root() {
  return (
    <>
      {/* Any web page: capture it to public/page.html, then edit src/page/scene.ts. */}
      <Composition id="PageCamera" component={PageCamera} durationInFrames={PAGE_DURATION_S * FPS} fps={FPS} width={W} height={H} />
      {/* A React subject (e.g. a component in "drive" mode): see examples/. */}
    </>
  )
}
