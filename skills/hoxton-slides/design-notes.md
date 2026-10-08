# Hoxton slides — design notes

Source: built for the GlobalData React vs Stencil decision deck (`globaldata/react-vs-stencil.html`). This folder strips that deck down to the reusable system, generic content only, and is packaged as the `hoxton-slides` skill. `index.html` is the layout library: one slide per layout, each tagged `data-layout`.

**Run locally:** open `index.html` in a browser (or serve the folder — `file://` blocks some browser fullscreen/clipboard APIs, and `deck.js` needs to load as a script file). Slides render one at a time at a fixed 1440×800, wrapped in a player frame that scales to fit the window; see §2 for the bar/panel/thumbnail chrome. `@media print` breaks each slide to its own page for a PDF export, with the chrome hidden.

---

## 1. What this is

Four files make a deck: the deck's own HTML (content only, built from `index.html` sections), `deck.css` (tokens, base styles, every layout's CSS), `logo.js` (the mark, injected into `[data-logo]`) and `deck.js` (the navigation engine). Copy the last three unchanged. No build step, no dependencies beyond two Google/Fontshare font links. Designed to be pasted into Figma slide-by-slide for further polish, not to ship as a live web page.

This is a folder now, not a single file — that's a deliberate trade. One canonical `deck.js` means a chrome fix or feature lands once and every project picks it up on next copy, instead of a single-file deck where bugs found on project 3 have to be hand-backported into whatever you copied for project 4. If a project genuinely needs a single-file handoff, inline `deck.css` into a `<style>` tag and `logo.js`/`deck.js` into `<script>` tags, dropping the external references. Nothing in them depends on being an external file.

## 2. Navigation and deck chrome

One slide visible at a time via `.slide.active { display:flex }`, everything else `display:none` — that's the one contract `index.html` has to hold up. Everything else (the bottom bar, the index panel, the scrim, hover thumbnails) is built and injected entirely by `deck.js` at runtime, into whatever page includes it. The slide itself stays a clean, untouched 1440×800 box — no controls ever render on top of it. All navigation is `position:fixed` at the window level, independent of the slide's scale-to-fit transform: a floating bar pinned to the bottom of the window, and a lightbox-style index panel pinned to the top-left with a scrim behind it.

- `?slide=N` query param controls which slide shows (1-indexed, clamped to the slide count). Next: Right/Down arrow, Page Down, Space. Previous: Left/Up arrow, Page Up, Shift+Space. Home/End jump to the first/last slide. Keys are ignored while a modifier is held or while focus is in a text field. The current slide is held in memory; the URL is updated via `history.replaceState` for deep links, and if the browser blocks that (e.g. `file://` in Safari) navigation still works.
- **Bottom bar** (`.dc-chrome`): fixed `left:24px;right:24px;bottom:24px`, so it spans the window (not the slide) at a constant size regardless of zoom. Index toggle, prev/next arrows, an `N / total` counter, a progress track, and a fullscreen toggle (`document.documentElement.requestFullscreen()`), left to right, in one dark pill.
- **Index panel** (`.dc-index-flyout`): fixed at the top-left of the window (`top:24px;left:24px`, stopping 92px above the bottom bar), a full contents list built from every slide's `data-title` attribute or, failing that, its `h1`/`h2` text. Opened via the hamburger button in the bottom bar.
- **Scrim** (`.dc-scrim`): a fixed, full-viewport `rgba(0,0,0,.55)` layer that fades in behind the index panel and in front of the slide — dims the slide and background together while the panel's open. Sits below the bottom bar in z-index, so the bar stays fully lit and usable even with the panel open. Click the scrim (or an entry in the panel, or Escape) to close.
- **Presenter notes** (`.dc-notes`): author notes inside a slide as `<aside class="notes">` (paragraphs or a list). deck.js hides them on the slide and in thumbnails, and shows the current slide's notes in a 20vw drawer pinned to the right of the window. A tab with a left-pointing chevron sits off-screen on the right edge and slides in when the cursor comes within 48px of it. Click the tab (or press N) to open the drawer; the chevron in the drawer, N or Escape closes it. While it's open, the slide rescales into the space to its left so the drawer never covers it. No scrim: the slide stays live. Print hides notes, tab and drawer.
- **Hover thumbnails**: hovering a progress-track segment clones the matching slide node (`cloneNode(true)`), scales it to the thumbnail size, and drops it in a small fixed-position preview box above the segment. This is a live DOM render, not a screenshot or a generated image — there's nothing to regenerate when slide content changes, and it's the reason any new slide type or component added to `index.html` gets a working hover thumbnail automatically, with no changes to `deck.js`. Keep new components inside a `.slide` element (not appended elsewhere in the DOM) so this keeps holding.
- The index list and the progress track are both built once at load from `document.querySelectorAll('.slide')` — add or remove a `<section class="slide ...">` block in `index.html` and the index, the track, the counter, and the thumbnails all adjust automatically, no changes needed in `deck.js`. Each slide still carries a `data-section` attribute for grouping/labelling later, it just isn't rendered anywhere visible right now.
- The slide stage scales to fit the browser window on load and on resize, reserving clearance so the fixed bottom bar never overlaps it, so the deck stays usable at any window size without changing the fixed 1440×800 authoring canvas.
- Print ignores all of this: `@media print` forces every slide to `display:flex !important`, stacks them with `page-break-after`, and hides the bar, panel and scrim entirely, so a PDF export contains every slide and none of the player UI.

### Attaching deck.js to a different deck

`deck.js` doesn't know anything about this template's content, colours or layout — it only touches whatever matches its slide selector (default `.slide`) and reads `data-title`/`data-section` off them. To wire it into an existing HTML deck that isn't built from this template:

1. Make sure each slide is its own element matching the selector, and that the page already has a rule that shows exactly one at a time via a shared class (`.slide.active{display:flex}` / `.slide{display:none}` — any display value works, deck.js only toggles the class).
2. Copy `deck.js` into that project folder unchanged.
3. Add `<script src="deck.js"></script>` at the end of `<body>`.
4. Done — no other markup changes required. deck.js wraps the slides in a scaling stage and injects the bar/panel/scrim/thumbnails at runtime.

If the existing deck uses a different class name for "this is a slide" or "this slide is showing," don't rename its markup — configure deck.js instead, via attributes on the same script tag: `data-slide-selector=".panel"`, `data-active-class="is-shown"`, `data-thumb-width="180"`. Chrome colour picks up the host's `--ink`/`--off`/`--coral`/`--rule-light`/`--muted-light`/`--body` custom properties if defined, and falls back to this template's palette if not.

## 3. Colour

```
--coral   accent, numerals, negative marks, pending/status tags
--ink     dark-slide background, body text on light slides
--paper   light-slide background
--off     text colour on dark slides
```

These four tokens plus two rule/muted variants per theme are the entire palette. Set real hex values at the `:root` block, that's the only place they live. If you don't have exact brand hex yet, sample from a logo or template asset and flag it as provisional, don't invent values.

**Spacing — universal rule.** `--space-1` through `--space-6` (8/16/24/32/48/64px) are declared at `:root` as the one spacing scale for the whole template. When you build a new component, its gaps, margins and padding should come from this scale, not arbitrary px values — that's what keeps every deck built from this file feeling like the same system, project to project.

## 4. Type

- **Display font** (headings only: `h1`, `h2`, `.col-head`) — swap the Fontshare/Google Fonts `<link>` and the `--display` variable together.
- **Body font** (everything else) — swap the `--body` variable.
- Scale: h1 88px / h2 52px / col-head 30px / lede 19px / body-title 17px / body-text 16px / marks 15.5px / eyebrow 12px uppercase. Don't introduce new sizes, use these.
- Both fonts need to be installed locally (or substituted deliberately) before pasting into Figma, or Figma will silently swap them on paste. That's a check to do before handover, not something to fix in code.

## 5. Logo

`logo.js` holds the mark as an SVG string in the `LOGO` constant, defaulting to the Shoreditch Design mark. For a client deck, replace it in the deck's copy of `logo.js` with the client's SVG, every `fill`/`stroke` set to `currentColor`. That's what makes it flip automatically between light and dark slides without a second asset. If Figma paste fidelity is poor with an inlined SVG, fall back to two static SVGs (one per colourway) and swap based on slide theme, ask before doing this since it changes the injection mechanism.

## 6. Layout

- Slide: 1440×800, padding 64px (`--space-6`) on every side, so vertical and horizontal insets match on every layout.
- Logo: absolute, top 64px, right 64px (the same inset), 101×33.
- The cover's title block sits on the bottom 64px line (`.cover`). Divider title blocks sit centred vertically (`.divider`). On the contact slide the title centres vertically and the contact details sit at the bottom of the content area, above the footer (`.contact`).
- Footer: deck.js adds a `.slide-footer` to every slide: page number, chapter (the slide's `data-section`) and "Shoreditch Design Studio", on a 3-column grid whose bottom edge sits on the 64px padding line (mirroring the logo on the top line; slide content stops 32px above it), page number left-aligned, chapter centred, studio name right-aligned, in 12px uppercase Cabinet Grotesk. It spans the full slide width on every layout, image slides included; on roadmap slides the items over the dark panel turn light. Add `data-footer="off"` to a slide to skip it (the cover does by default).
- Standard header pattern: `h1`/`h2`, then a 1px `.rule`, then `.content` at 56px margin-top.
- Three slide themes exist in CSS: `.slide--light`, `.slide--dark`, `.slide--coral`. **Default to `.slide--light`. Use `.slide--dark` for the single most impactful slide in a deck (the recommendation, a hard-hitting quote). Never use `.slide--coral` as a slide background** — coral is an accent only (numerals, negative marks, pending tags, `.metric .value`), never a fill. It stays defined in CSS for a rare one-off (a section divider, if a project specifically asks) but isn't a default choice.

## 7. Components — reuse these, don't invent new patterns

| Component | Use for | Slides in the GlobalData deck |
|---|---|---|
| `.stack` | Numbered sequential points, coral numerals, title over body | Overview, case-for-X, workflow, recommendation |
| `.compare` | Two-column A-vs-B with in-favour/against marks | Short-term / long-term comparisons |
| `.profile` | Bio/case-study: photo, name, about, labelled list left, media grid right | Team intro, case-study lead-in |
| `.quote` | One large statement, no other content on the slide | Testimonial, verbatim client quote |
| `.metrics` | Row of large coral numbers with a label under each | Headline results, evidence summary |
| `.metrics--cards` (+ `.metrics--3`) | Ruled cards: coral index at metric size, title, a sentence or two under it | User goals, pillars, measures |
| `.rows` | Ruled rows on the slide's thirds: coral index, title, text. Three to four items that each need a sentence or two | Instructions, principles, ground rules |
| `.footnote` | Bottom-anchored qualifier for the whole slide | Comparison slides |
| `.pending` | Coral-bordered status tag for a slide whose findings aren't in yet | Evidence slide, before the research lands |
| `.idx` | Coral chapter index inside a heading: `<span class="idx">01.</span>` | Every heading in a chaptered deck |
| `.agenda` | Contents rows: index, chapter, scope | Agenda |
| `.divider` | Chapter opener, big coral index over `h1` | One per chapter |
| `.statement` | One key message at h2 size | Chapter thesis |
| `.case` | Challenge / approach / outcome columns | Case studies |
| `.timeline` (+ `--3`, `--5`) | Phases on a shared rule with coral markers | Delivery plan |
| `.roadmap` (+ `--flip`) | Intro left, dark stage panel right (flipped on the second slide) | Process overview over two slides |
| `.gantt` | Workstream rows against a week/month scale, bars placed with `--start` / `--span` | Project plan |
| `.cc` | Vertical column chart, `--v` per column | Change over time |
| `.share` | 100% stacked bar plus four-up legend | Budget, time or traffic split |
| `.funnel` | Centred narrowing bars with count and drop-off | Conversion analysis |
| `.matrix` | 2×2 positioning plot with points and side notes | Competitor positioning |
| `.delta` | Before → after values per metric | Results against a baseline |
| `.steps` (+ `--2`, `--4`, `--rows`) | Columns left to right under a faint grey top rule, hanging 128px below the lede: index sitting on the title, text under it, 3-line minimum on the text | Any process: one column per step |
| `table.grid` | Ruled table, eyebrow headers, `tr.total` | Scope, pricing, feature matrix |
| `.bars` | Horizontal bar chart, `--v` sets length, `.bar--key` in coral | Simple data comparisons |
| `.split-media` + `.split-body` | Half-slide image left, text right | Design direction, context shots |
| `.media-full` + `.media-caption` | Full-bleed image with caption | Key screens, photography |
| `.team` + `.person` | Four-across people grid | Project team |
| `.logos` | Four-across ruled client wall | Credentials |
| `.contact` | Closing `h1` plus contact details | Final slide |

**Choosing between them.** Processes run horizontally in `.steps`, three across by default. Rules, tips and principles run vertically in `.rows`. Stroke-top cards (`.metrics--cards`) are a nice-to-have, not the house default, so don't use them on every slide. Content should fill the slide height rather than sit at the top with empty space underneath. Full guidance: "Choosing a layout" in `SKILL.md`.

If new content doesn't fit one of these, that's a signal to ask for a new component rather than bend the closest one or hand-roll something bespoke, keeps the deck internally consistent. Every slide should carry a `data-section` attribute (short label, not currently rendered but kept for later grouping) and, if it has no `h1`/`h2` of its own, a `data-title` attribute (used in the contents flyout) — see §2.

## 8. Output route

HTML → copy into Figma → refine there. Don't convert to PPTX, PDF or a React/JS app unless the brief specifically calls for it, the whole point of this template is a zero-build handoff. When copying slides into Figma, work from the slide markup only — `deck.js`'s chrome (bar, panel, thumbnails) is player UI, not deck content, and shouldn't get pasted in.

## 9. Content register (carried over from GlobalData, applies generally)

- Headings and prose follow the Headings and Writing sections of `SKILL.md` (topic-label headings, chapter indexes, Simplified Technical English at about 80%).
- Declarative, specification-register prose. No passive constructions, no rationale essays, no filler, no AI-sounding phrasing (run a humanizer pass before final handover).
- Every claim traceable to a real source (call notes, strategy docs, a client-approved deck). Nothing invented, nothing assumed.
- No em dashes in body copy. Heading-separator dashes (e.g. "Short term — now to December") are a deliberate typographic convention, not prose, and are fine to keep.
- Confirm the shape of a structural change (new section, split slide, reordered flow) before making it. Confirm content edits inline, don't batch several assumed changes into one pass.

## 10. Adding a layout to the library

1. Add its CSS to `deck.css` under its own commented block, using the tokens and the spacing scale (§3), with `.slide--dark` overrides where colour changes.
2. Add one example `<section data-layout="<name>" class="slide ...">` to `index.html` with generic placeholder copy.
3. Add a row to the layout table in `SKILL.md` and to the component table in §7.
4. Push to `main`. Vercel redeploys the preview; teammates pick it up with `npx skills update`.
