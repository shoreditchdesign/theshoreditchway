# Build patterns

Notes on the patterns in the first shipped walkthrough built this way (4 scenes, about 17s at 0.5x). `templates/starter.html` is the cleaned, client-agnostic version of the same patterns.

## Stage and scaling

- **The frame is 1440×900, not 1014×553.** `.stage` is the whole video frame: white, `overflow:hidden`. The 1014×553 product window (`.app-shell`) sits inset at `left:213px; top:173.5px`, so things can fly in from outside the window and get cropped by the frame edge, not the window edge. CSS at 50–77 and 80–93.
- **It scales like a video.** `.stage-wrap` is `max-width:1440px; aspect-ratio:1440/900`. A `ResizeObserver` sets `--stage-scale = wrap.clientWidth / 1440`. `.stage` uses `transform:scale(var(--stage-scale))` with `transform-origin:top left`. Nothing reflows, so the timing never drifts out of sync with the layout.
- **No `overflow:hidden` on `.app-shell` or `.main`.** It would clip the hero card's hover scale-up.
- **Two coordinate spaces:**
  - The cursor sits *inside* `.app-shell`, so every cursor point is window-relative.
  - Elements that fly in from off-window (`.dragged-card`, `.drag-chip`) sit at stage level, in frame coordinates.
- **Popups are placed with `%` of the window,** measured from the design file, so they hold their position at any scale.

## Tokens

- **Easing:** five CSS cubic-beziers in `timeline.md`. The JS mirrors each one as a `CustomEase` with a short name (`std`, `emp`, `exit`, `float`, `settle`), using the literal control points `M0,0 C x1,y1 x2,y2 1,1`. The rules:
  - entrances use `emp`
  - exits use `exit`
  - moves on screen use `std`
  - `settle` (overshoot) is only for punctuation moments
- **Duration tiers** (stated in `timeline.md`, not tokenised in the original):

  | Tier | Duration | Used for |
  |---|---|---|
  | quick | 200ms | click press |
  | standard | 280–320ms | entrances |
  | slow | 450ms | layout pushes |
  | dramatic | 700–900ms | count-ups, reveals, hero flights |

  `starter.html` adds them as `--dur-*` CSS variables plus a JS `DUR` object.
- **Global speed lever:** `master.timeScale(PLAYBACK_RATE)`. The first build shipped at `.5` after feedback. Tune the speed here first, before you touch individual durations.

## Timeline architecture

- **One `master` timeline:** `gsap.timeline({repeat:-1, defaults:{overwrite:'auto'}})`.
- **Labels:** each scene gets one (`scene1` to `scene4`), placed relative to the previous label: `master.addLabel('scene2', 'scene1+=3.48')`. Every tween inside a scene is positioned as `'sceneN+=<sec>'`, so its times match the per-scene ms in `timeline.md`.
- **Reset block per scene:** a run of `.set()` calls puts everything the scene touches back to pristine on every loop. This is the loop handling: there is no `onRepeat` logic.
- **Panel switching:** `body[data-scene]` picks which `.panel` is `display:flex`. It is flipped with `master.set(body, {attr:{'data-scene':…}})`, so it reverts when you scrub backwards.
- **`sceneLabels` map:** `{navKey: label}`. The debug scrubber reads it, and so does a QA hook where clicking a nav item seeks to that scene.
- **The first build was one flat timeline.** `starter.html` restructures it as one function per scene that returns its own sub-timeline, added via `addScene(key, label, build, overlap)`. Same labels, same contract, but scenes can be reordered and tuned in isolation.

## Helpers

| Helper | How it works |
|---|---|
| `arcMove` | One `motionPath` tween through a perpendicular mid-point offset (`clamp(10, len*.12, 28)` px), `curviness:1.25`, with an explicit start point. Not two chained legs: two legs each ease to a dead stop at the mid-point, which reads as jitter. |
| `clickBounce` | scale 1 → .85 (90ms `std`) → 1.08 (110ms `settle`) → 1 (100ms `std`). The press bottoms out at +90ms; nav glows and state changes sync to that moment. |
| `lightPop` | A smaller variant of the bounce, for clicking a card. |
| `fadeRise` | `autoAlpha:1, y:0`. **Its `dy` argument is unused.** The offset comes from the scene's reset `.set(..., {y:12})`. `starter.html`'s `staggerRise` uses `fromTo` instead. |
| `skeletonOn` | `tl.call(classList.add('skel-pulsing'))`. A call is not undone by scrubbing backwards, so scene 3 has to remove the class by hand at reset. `starter.html` sets a `data-skel` attribute through GSAP instead, which reverts on its own. |
| `popupExit` | Opacity fades out in 120ms while x/y/scale run for 300ms, so the popup dissolves mid-flight. The dx/dy point at the real frame edge. |
| `centerOf` | Measures live `getBoundingClientRect` and undoes the scale. **Unused.** It returns 0,0 for any element in a `display:none` panel. |
| `navGlow` | A separate overlay layer (double-background gradient border), so the glow can crossfade instead of swapping instantly. Content above it needs `position:relative; z-index:1`. |
| Count-up | The first build ended up with none: the donut became a static SVG. `starter.html` adds `countUp` (a proxy object plus `onUpdate`, which can be scrubbed). |
| Mask reveal | `clipPath: inset(0% N% 0% 0%) → inset(0)`. The three sparklines start at different times and end on the same beat. The chart starts at 80% hidden, so a stub of the line is already showing. |

## Bugs fixed (from the code comments)

1. **The panel swapped before the cursor arrived.** The label marks the *start* of the cursor's travel to the next tab, so swapping there showed scene N+1 mid-flight. The swap and reset now fire at arrival (`sceneN+=0.35/0.48/0.51`). `starter.html` puts this into `navClick()`.
2. **The cursor flew off-frame.** `centerOf()` measured an element in a hidden panel and got 0,0. The fix was hard-coded coordinates, measured with the scrubber. `starter.html`'s `targetOf()` fixes it at the root: it flips `data-scene` while measuring at build time and uses `offsetLeft/Top`, which ignore transforms and scale.
3. **Two-leg tweens stalled at the mid-point.** Cursor travel, the drag-chip and the scene 4 card each became one `motionPath`.
4. **The dragged copy stayed tilted.** The tilted drag-chip fades out while a flat copy fades in, in place.
5. **The dragged card landed out of shape.** It is built at exactly 1.726× a grid card's metrics, so a uniform `scale` lands on the real card's rect. Position, scale and rotation share one duration, and rotation resolves about 100ms early as follow-through.
6. **The gap opened too late.** The grid gap now opens about 45% into the flight, not on impact.
7. **The cursor detoured between scenes.** It now travels straight to the next nav item, with no stop at the sidebar rest point. The rest point is used only at the start and at the loop seam.
8. **The hero card's hover scale was hidden behind its siblings.** It now gets `zIndex:10`.
9. **The doc and the DOM disagreed.** Animate the real DOM: there are 3 skeleton rows, not the doc's 2.
10. **Watch the `overwrite:'auto'` default.** It is harmless when tweens on the same property don't overlap. When they do overlap, it kills the earlier tween's properties permanently, which breaks later loops and scrubbing. `starter.html` leaves overwrite at GSAP's default (`false`).

## Debug scrubber

`templates/debug-scrubber.js` documents how to use it.

- **What it gives you:** play/pause, a scrub bar, live speed, a jump button per scene, and "copy link". Deep links take the form `?debug=1&t=<sec>&speed=<rate>`.
- **Contract:** it only reads the globals `master` and `sceneLabels`.
- **Differences in the starter's copy:**
  - The original hard-codes four scene buttons. The starter generates them from `sceneLabels`.
  - The starter's nav-click QA hook doesn't pause first. That makes no difference: it calls `seek` and then `play` either way.

## Handoff diff: `index.html` → `output.html`

An actual `diff` of the two files shows `output.html` is `index.html` with **only** the DEV-ONLY comment fence and its `<script>` block cut. Nothing else changed.

Checklist for the next build:

- [ ] Cut from the `<!-- === DEV-ONLY …` comment through its closing `</script>`, in one go. Nothing else references it.
- [ ] Grep the result for `dev-scrubber`, `debug` and `sceneLabels`. `sceneLabels` should remain, because the nav-click QA hook uses it. Decide whether to keep that hook. The first build shipped with it, which means clicking a nav item in the live embed jumps the animation.
- [ ] Check `PLAYBACK_RATE` is the agreed value (first build: `.5`).
- [ ] Update `<title>`. The first build shipped still titled "Product Walkthrough Scaffold".
- [ ] Check the CDN dependencies are acceptable to the client:
  - GSAP 3.12.7 (core, CustomEase, MotionPathPlugin), from jsdelivr
  - Google Fonts
- [ ] Mobile: the stage scales as one rigid unit, so text becomes unreadable at phone widths. The breakpoint swap to the mp4 lives on the CMS side.
- [ ] Load `output.html` with no query string. Confirm there are no console errors and that it loops cleanly at least twice. Watch the seam from the last scene back to scene 1.
- [ ] The first build kept the full `<html>`, `<head>` and `<body>` wrapper. If the CMS block needs a fragment, strip the wrapper and keep this order: `<style>`, markup, GSAP tags, inline scripts.

## Verifying headless

- Use Playwright's own Chromium (`playwright-core` with `executablePath` pointing at `~/Library/Caches/ms-playwright/chromium-*/…`). Vivaldi headless hangs.
- Serve the files with `python3 -m http.server`.
- Two things will look like hangs:
  - A Google Fonts request that never resolves blocks the page's scripts. Abort `fonts.g*` in a route.
  - `page.evaluate(() => master.seek(t))` returns the timeline object, and Playwright hangs trying to serialise it. Always wrap the call: `() => { master.seek(t, false); }`.
