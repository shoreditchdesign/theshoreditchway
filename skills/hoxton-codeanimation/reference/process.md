# Process

How a code animation goes from storyboard to CMS embed. Each stage ends with something the user signs off before the next one starts.

## 1. Inputs

- **Design source: Figma or Paper.** Ask which one the storyboard lives in. Either works. The file should be built as editable layers: every component, tab and panel as its own frame, with stable layer names across artboards. This is what you scaffold the HTML from and measure against. If there is no design file at all (only screenshots or a live product), say that the build will be eyeballed from images and positions will need more feedback rounds.
- **Frames.** Storyboard stills exported from the artboards (Figma: select frames, export PNG at 2x; Paper: export), named `frames/Scene N.M.png` (scene, then beat). They show start and end states, not motion. Read every frame before anything else so you understand the product. If the user hasn't exported them, offer to pull them through the MCP (`get_screenshot` in either tool).
- **script.md.** Written by the user, not by you (format: `templates/script.md`). Prose per beat. Beat numbers are frame order and say nothing about timing. Numbers like "about 1.5x" or "around 30 degrees" are guesses meant to be checked against the design file.

## 2. Check the brief against the frames (no code)

Read script.md and every frame. Reply with numbered questions: anything ambiguous, any beat that doesn't match a frame, any element you can't find, any guessed number the design file contradicts. Don't write HTML or animation yet. Questions that come up on most builds:

- Which hover triggers which reveal, and what runs on its own clock?
- Which layer is an off-canvas element (something that flies in)? Trace the same layer name across frames to see where it enters.
- What are the real scale and rotation? Measure them in the design file (target width ÷ source width; the authored rotation) rather than trusting the script's rough numbers.
- **What is the video frame?** The full artboard, or the product window inside it? Crop happens at the frame, so this decides what can fly in from outside. Getting it wrong means rebuilding the layout. Ask up front.

## 3. timeline.md (no code)

Load the `motion-design` skill (and `css-animation` if available). Turn script.md into `timeline.md` using `templates/timeline.md`: easing tokens, duration tiers, global rules, cursor anchors, then one ms table per scene. Use real reflow math (an element's height plus the gap is how far the column moves), not "nudge a bit". Mark every interpretive call 🟡 and get answers before building. This file is the source of truth; the code is its execution.

## 4. Scaffold the static HTML from the design file

Use whichever MCP matches the design source. Check it's connected before starting. If it isn't, set it up for the user with `mcp-setup.md`; don't fall back to guessing from screenshots without saying so.

### Figma

The Figma MCP (remote or desktop). Needs a link to the frame: right-click the frame in Figma, Copy link to selection. If a `figma-design-to-code` skill is installed, load it before calling `get_design_context`.

1. `get_screenshot(nodeId)` to see it.
2. `get_metadata(nodeId)` for the layer tree, names, and each layer's x, y, width, height. Use these for every position and size the animation depends on.
3. `get_design_context(nodeId)` for markup and styles to translate into the starter's classes. It returns React + Tailwind by default; treat it as a reference, rewrite as plain HTML/CSS.
4. `get_variable_defs(nodeId)` for colour, type and spacing tokens.
5. Export assets (icons, illustrations, charts) as SVG from Figma, or use the asset URLs `get_design_context` returns. Download them into the project; those URLs expire.

If the Figma file has prototype animations on the frames, the `figma-implement-motion` skill can read them. Use its values as a starting point for timeline.md, not a replacement.

### Paper

Paper MCP runs locally inside the desktop app (`127.0.0.1:29979`). The app must be open. If tools fail, see `mcp-setup.md`.

Read pattern per artboard or component:

1. `get_screenshot(nodeId)` to see it.
2. `get_tree_summary(nodeId, depth: 4)` for the layer structure and names.
3. `get_jsx(nodeId, format: "inline-styles")` for markup and styles to translate into classes.
4. `get_children` / `find_nodes` to reach specific layers.
5. `get_node_info(nodeId)` for exact x, y, width, height. Use these for every position and size the animation depends on.
6. `get_computed_styles`, `get_font_family_info` for tokens and fonts.
7. `export` (PNG at high scale, or SVG) for raster or vector assets you won't rebuild.

Rules:

- Build one fixed-size `.frame` at the artboard size, layout absolute or flex inside it, then scale the whole frame (see `build-patterns.md`). Never let text reflow.
- `overflow: hidden` on the frame only. Not on inner wrappers that host hover scales, or they clip.
- Overlay positions (popups, modals) as **percentages of their container**, from `get_node_info`, not eyeballed.
- Gradient "angular" strokes: a separate overlay layer with a double background (`linear-gradient(#fff) padding-box, <gradient> border-box`), so GSAP can crossfade its opacity.
- Off-canvas elements live at frame level, in frame coordinates.
- Every panel's markup exists up front; scenes show and hide them.

Check the static build against the frames side by side before animating.

## 5. Animate

Start from `templates/starter.html`. One master GSAP timeline, one function per scene, rows from timeline.md placed at `'sceneN+=<ms/1000>'`. Easing tokens become `CustomEase` with the same beziers. See `gsap-vs-css.md` for what goes where.

Expect it to feel too fast. Slow it down with `PLAYBACK_RATE` on `master.timeScale()` before touching individual durations. Keep the rate as one constant.

## 6. Debug scrubber, then feedback by timestamp

Add the `?debug=1` scrubber (`templates/debug-scrubber.js`) as soon as the first pass plays. The user reviews by pasting lines like:

```
index.html?debug=1&t=4.215&speed=0.5 - popup 2 should sit under popup 1, left-aligned, as in frames/Scene 3.3.png
```

For each line: open the URL over HTTP (`python3 -m http.server 8000`; `file://` is blocked by the browser extension), confirm you see the problem on that frame, fix it, reload the same URL and check again. Screenshot when the fix is visual. Answer each line in order.

Feedback that comes up on most builds, so get it right first time:

- It should feel like one continuous video, not slides with smart animate. Single curved paths, no dead stops, no detours.
- The cursor goes straight to the next nav item. It does not return to a rest point between scenes, whatever the script's literal wording says.
- Swap the panel when the cursor arrives or clicks, not at the scene label.
- Move objects with combined transforms (position, scale, rotation at once).
- Exits faster than entrances; popups fly toward the frame edges, opacity faster than translate.
- Grids stagger in by row or column batches, never 16 cards one by one.
- Count-ups start near the final value (e.g. 90% of it, not 0) and get a fixed `min-width` so the layout doesn't shift.
- Don't measure `display:none` elements at runtime (returns 0,0). Hardcode measured coordinates or measure when visible.
- When the user pastes an SVG to swap in, change only what they asked for. Keep the rest of the geometry as it was.
- When a single sequence keeps failing, give it its own subagent with just that sequence and its measurements.

After each round, update timeline.md to match the code.

## 7. Handoff

See `handoff.md`.
