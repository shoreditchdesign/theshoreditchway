# Handoff

The dev build is `index.html` (with the scrubber). The deliverable is `output.html`: same file, debug block removed, ordered for pasting into a CMS. It goes to the client with a plain-text `README.txt`.

## Checklist

1. **Delete the debug scrubber.** It lives in its own `<script>` block near the end, fenced by the comment `DEV-ONLY — delete this whole <script> block before handing the embed to the client`. It only reads `master` and `sceneLabels`, so it comes out as one cut. Remove the `.debug-*` CSS too if it's in the main `<style>`.
2. **Order the file for pasting:** `<style>` first, then markup, then the GSAP `<script src>` tags (core, CustomEase, MotionPathPlugin, in that order), then the inline scripts. No `<html>`, `<head>` or `<body>` wrapper, and no dev page styles; the CMS block supplies the page. The README must describe the file exactly as sent.
3. **External dependencies.** GSAP and Google Fonts load from CDNs. Ask the client whether that's allowed, whether the fonts already load on the page, or whether to self-host.
4. **Mobile.** The frame scales down as one rigid unit, like a video. Text becomes unreadable well before phone width. Agree a breakpoint swap on the site side (this embed for desktop/tablet, the mp4 below it). Build the swap in the CMS, not in this file.
5. **Loop.** Play it end to end at least twice and check the seam where the last scene hands back to the first. Nothing should flash.
6. **Console.** Zero errors with `?debug` off.
7. **Playback rate.** `PLAYBACK_RATE` stays in the main script; the client gets the speed you reviewed at. Dev-only conveniences that live in the main script (e.g. nav-click-to-seek) can stay; they're harmless.
8. **Zip and version.** `<Client> - Video Explainer vN.zip` with `output.html` + `README.txt`. Bump N on each send. Zip from the CLI so no `__MACOSX` entries go in:

   ```sh
   zip -X "<Client> - Video Explainer vN.zip" output.html README.txt
   ```

## README.txt (WordPress)

Plain text, no Markdown. Sections, in this order:

- **WHAT THIS IS** — one paragraph: replaces the mp4, loops, scales like a video. List the three parts of the file (style, markup, scripts).
- **OPTION A — SIMPLEST (recommended)** — copy the whole of `output.html` into a Custom HTML block, preview, publish.
- **OPTION B — SCRIPTS IN FOOTER** — split: style into the block or Additional CSS, markup into the block, CDN tags plus inline scripts into the footer-scripts plugin (WPCode, Insert Headers and Footers). Keep load order.
- **BEFORE YOU PUBLISH — CHECK THESE** — external dependencies, mobile, test on the real page and check the console.
- **QUESTIONS** — most common break is the editor re-escaping quotes on paste; re-copy from the file, don't retype.

For Webflow, swap the WordPress steps for an Embed element (watch the 50,000-character limit; if over, host the script and link it) or page-level custom code.
