# GSAP vs CSS

Rule of thumb: **GSAP owns time, CSS owns state and loops.** Anything that sits on the scene timeline, has to be scrubbable, or has to line up with another beat goes in GSAP. Anything that is a static look, a hover-free state, or an endless idle loop goes in CSS.

The brief usually says "CSS or GSAP based on complexity". A multi-scene walkthrough with a cursor is always past that line: once beats chain across scenes, use GSAP.

The reason is the scrubber. The whole review loop depends on `master.time(t)` landing on an exact frame. A CSS transition or keyframe that GSAP doesn't own keeps its own clock, so it won't seek, pause or slow down with the rest. If a beat has to appear in a `?t=` link, it must be a tween.

## Use GSAP for

| Thing | How (first build) |
|---|---|
| Scene order and timing | One `master = gsap.timeline({repeat:-1})`. One function per scene returns a sub-timeline, added at a label. `sceneLabels` feeds the scrubber's jump buttons. |
| Easing tokens | `CustomEase.create('std', 'M0,0 C0.2,0 0,1 1,1')` etc. Same beziers as the CSS vars, so the doc, CSS and JS share one vocabulary. |
| Cursor travel | `MotionPathPlugin` through start, offset midpoint, end with `curviness:1.25`. Gives the 10–15px arc. A straight `x/y` tween looks mechanical. |
| Curved flights with rotation and scale | Same motionPath, with `rotation` and `scale` tweened alongside on their own easings (scene 4 card: rotation settles ~100ms before position). |
| Click bounce | Three chained `scale` tweens (press, overshoot, settle). Reused helper. |
| Stagger entrances | `stagger` on fade-and-rise tweens. |
| Mask reveals | Tween `clipPath` from `inset(0 100% 0 0)` to `inset(0 0 0 0)`. |
| Count-ups | Tween a plain object `{v:0}` and write `Math.round(v)` into the node `onUpdate`. |
| SVG draw-in | Tween `strokeDashoffset`. |
| Layout pushes | Tween `width` on the rail and `x` on the content together, same duration and ease, so they read as one push. |
| Clean loops | Each scene opens with `tl.set()` resets for everything it touches, so loop 2 starts identical to loop 1 and scrubbing backwards never leaves stale state. |
| Which panel shows | `tl.set('body', {attr:{'data-scene':'x'}})` at cursor arrival; CSS `[data-scene=x] .panel-x{display:flex}` does the rest. |
| Overall speed | `master.timeScale(PLAYBACK_RATE)`, one constant. Tune speed there, not by editing durations. |
| Toggling state classes | `tl.call()` or `tl.set()` at a time, so the class flips land on the timeline and undo when you scrub backwards. Prefer `set` (reversible) over `call`. |

## Use CSS for

| Thing | Why |
|---|---|
| Layout, tokens, the static design | Everything that is true at rest. Built from the design file, not animated. |
| Easing tokens as `--ease-*` vars | So any CSS transition uses the same curves as the timeline. |
| Skeleton pulse | `@keyframes skeleton-pulse` on `.skel-pulsing`, 1600ms, infinite. It is ambient, never synced to a beat, and should keep breathing while paused on a frame. GSAP adds the class when the bar lands. |
| Initial hidden states | Set opacity 0 / offsets in CSS or with `gsap.set` before the timeline is built, so there's no flash of unstyled frame on load. |
| Crossfadable states (gradient active stroke) | Draw the state on its own overlay layer in CSS; GSAP tweens that layer's opacity. A class swap would be instant. |
| Scale-to-fit stage | A fixed design-size stage scaled with `transform: scale()` from a small resize handler. The animation itself only ever deals in stage pixels. |

## Don't

- Don't give GSAP-driven elements (the cursor especially) a CSS `transition`. It double-eases.
- Don't animate with CSS `transition` on something GSAP also tweens. They fight and the scrub breaks.
- Don't use `setTimeout` / `setInterval` for beats. They can't be scrubbed. Use timeline positions.
- Don't use linear easing for movement. Linear only for true ambient loops.
- Don't use CSS `animation` for one-shot entrances. They replay on class re-add and ignore scrubbing.
- Don't add a plugin for one effect you can tween by hand. The first build needed only core, CustomEase and MotionPathPlugin.

## Dependencies

Pin exact versions on jsDelivr, loaded in this order: core, CustomEase, MotionPathPlugin, then the inline scripts. The first build used `gsap@3.12.7`. GSAP and all its plugins are free to use, including on commercial sites.

The client may want these self-hosted. Ask before handoff (see `handoff.md`).
