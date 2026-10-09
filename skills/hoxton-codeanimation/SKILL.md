---
name: hoxton-codeanimation
description: "Build a product walkthrough or explainer animation as one self-contained HTML/CSS/GSAP file that replaces an mp4 (sharp at any resolution, droppable into WordPress or Webflow). Guides the user step by step through the Shoreditch Design process, asking questions at each stage: storyboard frames from Figma or Paper, a script.md brief, a ms-level timeline.md, a static HTML rebuild from the design file, the GSAP master timeline with a fake cursor, a ?debug=1 scrub panel for timestamped feedback, and the client handoff. Use when someone asks for a code animation, an animated product walkthrough, an explainer video in HTML, an animatic, or to turn Figma or Paper frames into a looping animation."
---

# Hoxton code animation

Shoreditch Design's way of making explainer animations in code. Output is one HTML file: a fixed-size stage that scales like a video, a fake cursor clicking through a product UI, and one GSAP master timeline that loops. It replaces an mp4 that looked blurry on desktop.

Built from a shipped product walkthrough (Aug 2026, 4 scenes, about 17s at 0.5x). "The first build" in these docs means that project.

## Who you're working with

Assume the user has never run this process. They may be a designer or developer handed this skill by a colleague. So:

- **Do the setup for them.** Install and connect tools (MCP servers, the local server) yourself; only hand over the steps that need their hands, and give exact words for those.
- **Explain before you act.** At the start, give a short overview of the 7 steps below in plain words, and say which one you're starting.
- **Say where you are** at the start of each step ("Step 3 of 7: timeline"), what it produces, and what you need from them.
- **Ask, don't assume.** Each step has questions below. Ask them as a short numbered list and wait for answers. Offer a sensible default for each so they can reply "defaults are fine".
- **Stop at every checkpoint.** Each step ends with something for them to look at and approve. Don't start the next step until they say so.
- **Explain tools when they first appear:** the design-file MCP, the local server, the debug panel. Never assume they know a query param or a terminal command; give the exact link or command.
- **Keep messages short.** One step at a time. Point to files instead of pasting them.

## Files in this skill

| File | Role |
|---|---|
| `reference/process.md` | The whole process in detail, including Figma and Paper MCP calls and what came up in feedback on the first build. Read first. |
| `reference/mcp-setup.md` | Checking, installing and signing in to the Figma or Paper MCP on the user's behalf. |
| `reference/debug-panel-guide.md` | How to explain the debug panel and the feedback format to the user. |
| `reference/gsap-vs-css.md` | What goes in GSAP, what stays in CSS, and why. |
| `reference/build-patterns.md` | Stage scaling, timeline structure, helpers and known bug fixes. |
| `reference/handoff.md` | Turning the dev build into the client file, the plain-text README, zipping. |
| `templates/script.md` | Brief format, one section per storyboard frame. |
| `templates/timeline.md` | Source-of-truth format: easing tokens, duration tiers, global rules, per-scene ms tables. |
| `templates/starter.html` | Working starter: 1440×900 frame, window inset, cursor, two scenes, master timeline, helpers, debug panel. |
| `templates/debug-scrubber.js` | The debug panel as a standalone block. Already inside the starter. |

If the environment can't read local skill files, fetch them from `https://theshoreditchway.vercel.app/skills/hoxton-codeanimation/<path>`. Live starter: `https://theshoreditchway.vercel.app/skills/hoxton-codeanimation/templates/starter.html?debug=1`. Showing the user this link early is the fastest way to explain what they'll get.

## The 7 steps

### 1. Kickoff

Explain the process in a few lines and show the live starter link. Then ask:

1. Where do the storyboard designs live: **Figma, Paper**, or only screenshots? (Figma and Paper both work. Screenshots only means positions get eyeballed and need more review.)
2. Link to the file or the frames. For Figma, "Copy link to selection" on the frame.
3. Check the design-file MCP yourself; don't ask the user whether it's connected. If it's missing or failing, tell them in one line, then set it up for them following `reference/mcp-setup.md` (install, sign-in, test call). Only ask them for the steps you can't do: opening Paper, signing in to Figma in the browser, typing a slash command, or restarting the session.
4. Are storyboard frames exported (`frames/Scene N.M.png`)? If not, offer to pull them through the MCP.
5. Is there a written brief (`script.md`)? If not, offer `templates/script.md` and explain they describe each frame in plain words; you'll write it with them if they talk you through it.
6. What is the video frame: the whole artboard, or the app window inside it? (Things that fly in get cropped at the frame edge.)
7. Where will it go: WordPress, Webflow, other? Is there a mobile fallback (usually the old mp4 below a breakpoint)?
8. Rough length and pace? (Default: about 4s per scene, calm, corporate.)

Create a project folder: `frames/`, `script.md`, later `timeline.md`, `index.html`.

**Checkpoint:** inputs in place, answers agreed.

### 2. Check the brief against the frames (no code)

Tell the user you're reading every frame and the script to check they agree, before any code. Reply with numbered questions: anything ambiguous, beats that don't match a frame, elements you can't find, guessed numbers the design file contradicts. See `process.md` §2.

**Checkpoint:** every question answered.

### 3. Timeline (no code)

Explain: `timeline.md` is the plan for every movement, in milliseconds, written before code so timing can be argued on paper. Load the `motion-design` skill (and `css-animation` if present). Use `templates/timeline.md`. Flag your own calls with 🟡 and list them for the user at the end.

**Checkpoint:** user reads `timeline.md` and resolves the 🟡 items.

### 4. Static rebuild from the design file

Explain: you're rebuilding the screens as real HTML from the design file so text stays sharp, with nothing moving yet. Start from `templates/starter.html`. Use the Figma or Paper path in `process.md` §4. Measure positions; don't eyeball.

**Checkpoint:** serve it (give the exact command and link) and ask the user to compare it with the frames. Fix differences before animating.

### 5. Animate

Build the timeline into the starter's scene functions. Tell the user it will probably feel too fast at first; that's normal and is tuned in step 6 with one speed setting.

**Checkpoint:** first full playthrough.

### 6. Review with the debug panel

Introduce the debug panel using `reference/debug-panel-guide.md`: how to open it, what each control does, how to copy a frame link, and the one-line feedback format. Then loop:

- User sends feedback lines (link + comment).
- You open each link, fix, re-check on the same link, and reply per line with the link to check.
- Update `timeline.md` to match after each round.

Ask after each round: "Anything else, or ready for handoff?"

**Checkpoint:** user says it's ready.

### 7. Handoff

Explain what the client gets and why the debug panel comes out. Follow `reference/handoff.md`. Ask before sending: are CDN fonts/scripts OK on the client site, and who builds the mobile swap?

**Checkpoint:** user has the zip and the README.

## Build rules

- **It's a video, not a slideshow.** Continuous motion, single curved paths, no dead stops between beats.
- **Measure, don't eyeball.** Sizes, positions, scale ratios and rotations come from the design file. Numbers in script.md are guesses to check.
- **Fixed stage, scaled as one unit.** Never let text reflow. `overflow:hidden` only on the frame, never on wrappers that host hover scales.
- **GSAP owns time, CSS owns state and ambient loops.** Anything that must land on a `?t=` frame is a tween. No `setTimeout`, no CSS transitions on GSAP-driven elements.
- **Cursor:** one MotionPath tween per move with a 10–15px arc, distance-scaled duration, click bounce on every click. It goes straight to the next nav item; it only returns to rest at the loop seam.
- **Panels swap on cursor arrival or click**, not at the scene label.
- **Combined transforms.** Position, scale and rotation start together; rotation may settle about 100ms early.
- **Exits are quicker than entrances.** Opacity faster than translate, toward the frame edges, light stagger (~80ms).
- **Batch staggers.** Grids come in by row or column, not card by card.
- **Every scene resets what it touches** with `tl.set()` at its start, so loops and backward scrubs stay clean.
- **Keep the debug panel in its own fenced DEV-ONLY `<script>`** from the start, so handoff is one cut.
- **timeline.md and the code stay in sync.** Change one, change the other.
- When the user pastes an asset (SVG, copy), change only what they asked for.
