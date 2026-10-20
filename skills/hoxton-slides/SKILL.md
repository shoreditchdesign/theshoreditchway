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
| `deck.js` | Navigation engine: bottom bar, index panel, hover thumbnails, presenter notes drawer (N or the right-edge chevron), slide footer, `?slide=N`, arrow keys, fullscreen, print. Copy unchanged. |
| `design-notes.md` | Rules: themes, type, layout, components, content register. Read before writing. |
| `logo.svg` | Shoreditch mark as a standalone file. |

## Workflow

1. Read `design-notes.md` and `index.html` from this skill folder.
2. Outline the deck as a list of slides, each mapped to a layout below. Confirm the outline with the user before writing slides.
3. Create a folder for the deck. Copy `deck.css`, `logo.js` and `deck.js` into it unchanged.
4. Write `index.html` in that folder: same `<head>` as the library (font links + `deck.css`), then one `<section>` per slide copied from the matching library layout, then `<script src="logo.js"></script>` and `<script src="deck.js"></script>` at the end of `<body>`.
5. Every slide keeps `<div class="logo" data-logo></div>`, a `data-section` label (it also feeds the footer's chapter name), and a `data-title` if it has no `h1`/`h2`. Presenter notes go in an `<aside class="notes">` inside the slide; deck.js shows them in the right-hand notes drawer (N or the right-edge chevron).
6. Open the file in a browser and step through every slide to check nothing overflows the 1440×800 frame.

If the environment can't read local skill files, fetch them from `https://theshoreditchway.vercel.app/skills/hoxton-slides/<file>`.

## Layouts

| `data-layout` | Use for |
|---|---|
| `cover` | Opening slide. Dark, `h1`, short subtitle, date. |
| `agenda` | Contents. One row per chapter: index, chapter name, what it covers. |
| `divider` | Chapter opener. Big coral index over the chapter name. Dark. |
| `statement` | One key message at heading size. Use once per chapter at most. |
| `stack` | Numbered sequential points, title over body. |
| `compare` | Two-column A vs B with in-favour/against marks. `.footnote` only for a data source or citation (see Hard rules). |
| `matrix` | 2×2 positioning chart: plotted competitors, client point in coral, notes on the right. Place points with `--x` / `--y`. |
| `case` | Case study: challenge, approach, outcome in three columns. |
| `timeline` | Phases left to right with dates and deliverables. 4 by default, `.timeline--3` / `.timeline--5`. |
| `gantt` | Workstreams against a week or month scale. `--cols` on `.gantt`, `--start` / `--span` per bar, `.gantt-bar--key` for the milestone. |
| `roadmap` | Process overview: heading on one side, dark panel of numbered stages on the other. Split a long process over two slides, the second with `.roadmap--flip`. |
| `steps` | Any process or sequence of actions. Columns left to right under a faint grey top rule, hanging 128px below the lede: index directly on the step title, text under it. 3 across by default, `.steps--2` / `.steps--4`; six items wrap with `.steps--rows`. |
| `table` | Scope, pricing, feature matrix. `tr.total` for a totals row, `.yes` / `.no` for marks. |
| `bars` | Horizontal bar chart. Set each bar with `style="--v:64%"`, largest value = 100%. `.bar--key` highlights one bar in coral. |
| `columns` | Vertical column chart over time. `--v` per column, largest = 100%. `.cc-col--key` for the highlight. |
| `share` | One 100% stacked bar plus legend: budget, time or traffic split. Up to four segments, `--v` per segment. |
| `funnel` | Conversion stages as centred bars narrowing down, with count and drop-off. `.funnel-row--key` for the problem stage. |
| `metrics` | Row of big coral numbers with a label each. |
| `delta` | Before and after per metric: old value muted, new value coral. Three across, `.delta--4` for four. |
| `cards` | Three or four ruled cards: coral index, title, a sentence or two. Not a default; see Choosing a layout. |
| `rows` | Ruled rows on the thirds: index, title, text. Rules, tips and principles. `.rows--5` for five items. |
| `split` | Image fills the left half, heading and points on the right. |
| `image` | Full-bleed image or screen with a caption bottom left. |
| `profile` | One person or project: photo, bio, list left, media grid right. |
| `team` | Grid of people: photo, name, role. Four across. |
| `logos` | Client logo wall, four across. |
| `quote` | One large verbatim statement. Nothing else on the slide. |
| `close` | Dark recommendation or decision slide using `stack`. |
| `contact` | Closing slide: `h1` plus contact details. |

### Choosing a layout

- A process (steps someone follows in order) goes horizontal: `steps`, 3 across by default, 4 for four steps. Not a vertical list.
- Rules, tips, principles and other parallel points go vertical: `rows`, or `stack` for a dark close.
- A process overview with many stages goes on `roadmap` slides, then one `steps` slide per stage, its heading carrying the stage index.
- When a slide lists parts that each need detail, give each part its own slide after it. Don't summarise three parts and then detail only one.
- Content fills the slide. Panels stretch to the bottom of the content area; they don't hug the heading and leave the lower half empty.
- Stroke-top cards (`cards`) are an option, not the default. Don't reach for them on every slide.
- Coral marks indexes and numerals. Titles stay in the text colour.

Content that fits none of these: ask the user before inventing a layout. A new layout belongs in the library (see `design-notes.md` §10), not hand-rolled in one deck.

## Headings

- Headings are topic labels, not sentences. 1 to 4 words, a noun phrase, no full stop. Write "Delivery timeline", not "Here is how we will deliver the project". Write "Build options", not "We compared three ways to build it".
- Make each heading specific to its slide's topic. No generic labels ("Overview", "Key points", "Summary") when a specific one exists.
- When the deck has chapters or phases, number them `01.`, `02.`, `03.` and carry the index on every heading inside that chapter: `<h2><span class="idx">02.</span>Build options</h2>`. The `agenda` and `divider` slides use the same numbers. Slides outside any chapter (cover, quote, contact) take no index.
- The slide's message goes in the body or a `statement` slide, never in the heading.

## Writing: Simplified Technical English, about 80%

Write slide copy to the rules of Simplified Technical English (ASD-STE100), the controlled language for aerospace and industrial manuals. It makes text fast to scan and stops filler. Apply it about 80% of the way: follow the rules below by default, and break one only where the brand voice or a client's own terms need it.

- One topic per sentence. One instruction per step.
- Short sentences: 20 words maximum for instructions, 25 for descriptions. On slides, aim for 15.
- Active voice. Name who does the action: "The team audits the site", not "The site will be audited".
- Present tense by default. Future tense only for planned work.
- Use verbs, not nouns made from verbs: "Test the prototype", not "Conduct testing of the prototype".
- Simple, common words. One word for one meaning, and the same term for the same thing everywhere in the deck. Do not swap synonyms for variety.
- No filler, no hedging, no intensifiers ("very", "really", "truly", "seamless", "robust", "leverage", "unlock", "elevate").
- Lists for sequences and sets of three or more. Numbered when order matters.
- Paragraphs: 3 sentences maximum on a slide.
- Numbers as digits, with units. State the source for every number.

The 20% that stays flexible: client and product names, technical terms the client uses, a deliberate line of brand voice on the cover, a divider or the close, and verbatim quotes, which stay exactly as given.

## Hard rules

- Default to `.slide--light`. Use `.slide--dark` for the cover, dividers, the close and the single most important slide. Never use `.slide--coral` as a background.
- Only sizes from the type scale and spacing from `--space-*`. No new fonts, colours or sizes.
- Every claim traces to a source the user gave you. No invented numbers, names, quotes or clients. Use `<span class="pending">Findings pending</span>` where evidence is missing.
- No em dashes in body copy.
- No footnotes or captions by default. Add a `.footnote` only when the slide shows data (numbers, charts, metrics) and needs its source, or when it cites a specific clause or article (e.g. "RFP §2.3"). Never use one for a general source line, a recap or a qualifier; put that in the presenter notes instead.
- Frame: 64px padding on every side, logo at the same 64px inset top right and the footer on the bottom 64px line. The cover's title block sits on the bottom 64px line; divider titles centre vertically; the contact title centres with its details at the bottom. deck.js adds the footer (page number left, chapter from `data-section` centre, "Shoreditch Design Studio" right, 12px uppercase Cabinet Grotesk) to every slide; `data-footer="off"` skips one, and the cover skips it by default. Don't override these per deck.
- Don't convert to PPTX, PDF or a framework app unless asked.
