---
name: hoxton-slides
description: Build a Shoreditch Design presentation deck as HTML from the Hoxton layout library (1440×800 slides, Inter + Cabinet Grotesk, coral accent, keyboard navigation, Figma-ready). Use when someone asks for a deck, slides, a presentation, a pitch, a client decision deck, or slides to present on a call.
---

# Hoxton slides

Shoreditch Design's deck system. A deck is one HTML file of `<section class="slide">` blocks plus three shared files copied unchanged: `deck.css`, `logo.js`, `deck.js`. No build step. Open the HTML in a browser to present; paste slides into Figma to polish.

Live preview of every layout: https://theshoreditchway.vercel.app/skills/hoxton-slides/

## Files in this skill

| File | Role |
|---|---|
| `index.html` | Layout library. One example slide per layout, each tagged `data-layout="<name>"`. Read it for markup. |
| `deck.css` | Tokens, type scale, spacing scale, every layout's CSS. Copy unchanged. |
| `logo.js` | Injects the logo into `[data-logo]`. Shoreditch mark by default. Swap the `LOGO` SVG for a client deck. |
| `deck.js` | Navigation engine: bottom bar, index panel, hover thumbnails, `?slide=N`, arrow keys, fullscreen, print. Copy unchanged. |
| `design-notes.md` | Rules: themes, type, layout, components, content register. Read before writing. |
| `logo.svg` | Shoreditch mark as a standalone file. |

## Workflow

1. Read `design-notes.md` and `index.html` from this skill folder.
2. Outline the deck as a list of slides, each mapped to a layout below. Confirm the outline with the user before writing slides.
3. Create a folder for the deck. Copy `deck.css`, `logo.js` and `deck.js` into it unchanged.
4. Write `index.html` in that folder: same `<head>` as the library (font links + `deck.css`), then one `<section>` per slide copied from the matching library layout, then `<script src="logo.js"></script>` and `<script src="deck.js"></script>` at the end of `<body>`.
5. Every slide keeps `<div class="logo" data-logo></div>`, a `data-section` label, and a `data-title` if it has no `h1`/`h2`.
6. Open the file in a browser and step through every slide to check nothing overflows the 1440×800 frame.

If the environment can't read local skill files, fetch them from `https://theshoreditchway.vercel.app/skills/hoxton-slides/<file>`.

## Layouts

| `data-layout` | Use for |
|---|---|
| `cover` | Opening slide. Dark, `h1`, short subtitle, date. |
| `stack` | Numbered sequential points, title over body. |
| `compare` | Two-column A vs B with in-favour/against marks. Optional `.footnote`. |
| `targets` | Grid of evidence items plus a measures strip. Add `.targets--4` for 7+ items. |
| `profile` | Team member or case study: photo, bio, list left, media grid right. |
| `quote` | One large verbatim statement. Nothing else on the slide. |
| `metrics` | Row of big coral numbers with a label each. |
| `cards` | Three or four ruled cards: coral index, title, a sentence or two. |
| `rows` | Three or four ruled rows on the thirds: index, title, text. |
| `close` | Dark recommendation or decision slide using `stack`. |

Content that fits none of these: ask the user before inventing a layout. A new layout belongs in the library (see `design-notes.md` §10), not hand-rolled in one deck.

## Hard rules

- Default to `.slide--light`. Use `.slide--dark` for the cover and the single most important slide. Never use `.slide--coral` as a background.
- Only sizes from the type scale and spacing from `--space-*`. No new fonts, colours or sizes.
- Every claim traces to a source the user gave you. No invented numbers, names, quotes or clients. Use `<span class="pending">Findings pending</span>` where evidence is missing.
- Declarative prose, no filler, no em dashes in body copy.
- Don't convert to PPTX, PDF or a framework app unless asked.
