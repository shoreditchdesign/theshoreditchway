# Build patterns

How a code animation is put together. `templates/starter.html` implements every pattern here; read it alongside this file.

## Frame and scaling

- **The frame is the video.** `.frame` is a fixed-size artboard at the storyboard's size (`--frame-w`, `--frame-h`), with `overflow:hidden`. Its edge is the only crop edge.
- **Optional product window.** If the product sits in a window inside the frame, `.window` is content inset in the frame (`--window-w`, `--window-h`, position from the design file). Leave room around it so elements can fly in from outside the window and get cropped by the frame, not the window. If the product fills the frame, delete the window.
- **Scale like a video.** `.frame-wrap` has `max-width` equal to the frame width and the frame's `aspect-ratio`. A `ResizeObserver` sets `--frame-scale = wrap width / frame width`, and `.frame` uses `transform:scale(var(--frame-scale))` from the top left. Nothing reflows, so layout and timing never drift apart.
- **No `overflow:hidden` on inner wrappers.** It clips hover scale-ups and anything that moves past a container edge. Only the frame crops.
- **Two coordinate spaces, decided once:**
  - The cursor lives inside the window, so cursor points are window-relative.
  - Elements that fly in from outside the window live at frame level, in frame coordinates.
  - Write in `timeline.md` which space each coordinate uses.
- **Overlays (popups, modals) are placed in `%` of their container,** measured from the design file, so they hold position at any scale.

## Tokens

- **Easing:** five cubic-beziers, declared as `--ease-*` CSS variables and mirrored as GSAP `CustomEase` with short names (`std`, `emp`, `exit`, `float`, `settle`), using the literal control points `M0,0 C x1,y1 x2,y2 1,1`. Rules:
  - entrances use `emp`
  - exits use `exit`
  - on-screen moves use `std`
  - objects in flight use `float`
  - `settle` (overshoot) only for punctuation moments
- **Duration tiers,** as `--dur-*` CSS variables and a JS `DUR` object:

  | Tier | Duration | Used for |
  |---|---|---|
  | quick | 200ms | click press |
  | standard | 280–320ms | entrances, popups |
  | slow | 450ms | layout pushes, panel dissolve |
  | dramatic | 700–900ms | count-ups, reveals, flights |

- **Global speed lever:** `master.timeScale(PLAYBACK_RATE)`, one constant. A first pass almost always feels too fast. Tune overall speed here first, before touching individual durations.

## Timeline architecture

- **One `master` timeline:** `gsap.timeline({repeat:-1})`. Leave `overwrite` at GSAP's default (`false`). `overwrite:'auto'` permanently kills an earlier tween's properties when two tweens on the same property overlap, which breaks later loops and scrubbing.
- **One function per scene,** returning its own sub-timeline, added at a label with `addScene(key, label, build, overlap)`. Scenes can then be reordered and tuned in isolation. A scene owns its travel in, its click, its reset, its beats and its exit.
- **Labels:** one per scene. Tweens inside a scene are positioned in seconds from the scene's own start, matching the per-scene ms in `timeline.md`.
- **Reset block per scene:** `.set()` calls at the start of each scene put everything it touches back to its starting state. That is the loop handling; no `onRepeat` logic.
- **Panel switching:** `body[data-scene]` decides which `.panel` shows. Flip it with a timeline `.set(body, {attr:{'data-scene':…}})` so it reverts when scrubbing backwards.
- **`sceneLabels` map:** `{navKey: label}`. The debug panel reads it for its scene buttons.

## Helpers in the starter

| Helper | What it does |
|---|---|
| `arcMove` | Cursor (or object) travel as ONE `motionPath` tween through a perpendicular mid-point offset (`clamp(10, len*.12, 28)` px), with an explicit start point. |
| `travelDur` | Travel time scaled by distance, so short hops are quick and long moves aren't rushed. |
| `clickBounce` | scale 1 → .85 → 1.08 → 1, 300ms. The press bottoms out at +90ms; sync state changes to that moment. |
| `navClick` | Bounce, then at press-bottom flip `data-scene`, clear glows, crossfade the new nav state in. |
| `panelIn` / `panelOut` | Entrance scale-and-fade; exit that dissolves in place or flies toward the frame edge, opacity faster than movement. |
| `staggerRise` | Fade-and-rise with a stagger, using `fromTo` so it is correct on every loop. |
| `countUp` | Tweens a proxy object and writes the number `onUpdate`, so it scrubs both ways. |
| `maskReveal` | `clipPath: inset(0 N% 0 0) → inset(0)`. |
| `skeletonOn` | Sets a `data-skel` attribute through the timeline, so the CSS pulse switches off again when scrubbing backwards. |
| `targetOf` | Window-relative centre of an element for cursor targets, measured at build time. Temporarily shows the element's panel while measuring. |

## Rules that prevent the usual bugs

- **Swap panels on cursor arrival or click, not at the scene label.** The label marks the start of the cursor's travel; swapping there shows the next scene before the cursor gets there.
- **Never measure an element while it is `display:none`.** It returns 0,0 and sends the cursor off-frame. Measure at build time with its panel shown (`targetOf`), using `offsetLeft/Top`, which ignore transforms and scale.
- **One `motionPath` per move, never two chained legs.** Two legs each ease to a dead stop at the mid-point, which reads as a stutter.
- **Combined transforms.** Position, scale and rotation start together on one duration; rotation may settle about 100ms early as follow-through. Never sequential steps.
- **Size flying copies to land exactly.** If an element flies in and becomes another element, build it at the target's proportions so a uniform `scale` lands on the target's rect. Swap tilted or styled copies for the final element with a crossfade in place.
- **Start layout reactions before impact.** When an arriving element pushes others aside, open the gap partway through its flight, not when it lands.
- **Raise the z-index of anything that scales up on hover,** or its siblings paint over it.
- **The cursor goes straight to the next target.** No detour to a rest point between scenes. Use a rest point only at the start and at the loop seam.
- **Animate the real DOM, not the brief.** If the brief and the markup disagree (counts, order), the markup wins and the brief gets corrected.
- **No `tl.call()` for state that must undo.** Calls don't reverse on a backwards scrub. Use `.set()` on an attribute or class.

## Verifying headless

- Use Playwright's own Chromium (`playwright-core` with `executablePath` set to the cached Chromium). Some installed browsers hang headless.
- Serve the files over HTTP (`python3 -m http.server`), not `file://`.
- Two things look like hangs:
  - A web-font request that never resolves blocks the page's scripts. Abort font requests in a route.
  - `page.evaluate(() => master.seek(t))` returns the timeline object, and Playwright hangs serialising it. Wrap the call: `() => { master.seek(t, false); }`.
