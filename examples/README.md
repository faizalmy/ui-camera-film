# Examples: live React components

Choreography only. These subjects are styled with Tailwind v4 + shadcn: add `tailwindcss`,
`@tailwindcss/postcss`, `@remotion/tailwind-v4` (wrap the webpack override with `enableTailwind`), the
block's `globals.css` imported from `src/video.css`, `motion`, and register each film with a
`<Composition>` in `src/Root.tsx` (UsageCamera: 31 s, 1920 x 1440, 60 fps). The subjects are ReUI Pro blocks (`ai-usage-1`, `agent-activity-1`), which are licensed
and not included: install them with the shadcn CLI and your license, then add a `drive` prop to each
(state from the frame, timers off), as SKILL.md describes.

- `reui-ai-usage/`: copy into `src/usage/`. The film runs on the engine through `scene.ts` (build-in,
  waves on zoomed shots, the ruler drag and every click), with seeked block transitions in `UsagePanel.tsx`.
- `reui-agent-activity/`: copy `Camera.tsx`, `Flat.tsx`, `timeline.ts` into `src/`, `Panel.tsx` into
  `src/layers/`, and merge `rig-agent.ts` into `src/rig.ts`.
