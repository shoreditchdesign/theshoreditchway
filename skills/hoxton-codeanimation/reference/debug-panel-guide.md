# Reviewing with the debug panel

Show this to the user, in your own words, the first time the animation plays. Don't assume they've used it before.

## Open it

1. The file has to be served, not double-clicked. You start the server; give the user the link:
   ```sh
   python3 -m http.server 8000
   ```
   `http://localhost:8000/index.html?debug=1`
2. Without `?debug=1` the page looks exactly like the client will see it. With it, a dark bar appears along the bottom.

## What the bar does

| Control | Use it to |
|---|---|
| Play / pause | Stop on any moment. |
| Scrub bar | Drag to any point. Backwards works too; everything rewinds cleanly. |
| Time readout | Current time / total length, in seconds. |
| Speed | Type a rate. `0.25` to study a fast moment, `2` to check the overall flow. |
| Scene buttons | Jump to the start of each scene. The current scene is highlighted. |
| Copy link | Copies a link to the exact frame and speed you're on, e.g. `index.html?debug=1&t=4.215&speed=0.5`. |

Opening a copied link lands paused on that frame.

## Giving feedback

One line per issue: the copied link, a dash, what's wrong. Screenshots or a frame name help.

```
index.html?debug=1&t=4.215&speed=0.5 - popup 2 should sit under popup 1, left-aligned, like frames/Scene 3.3.png
index.html?debug=1&t=9.80&speed=0.5 - card flight feels like two steps, should rotate and scale at once
index.html?debug=1&t=1.20&speed=0.5 - whole thing still too fast
```

Feel notes ("too fast", "jittery", "looks like slides") are useful too; they don't need a timestamp.

The agent opens each link, fixes it, re-checks on the same link and replies per line, with a link to check.

## Before it goes to the client

The bar is in its own block marked DEV-ONLY and is removed at handoff. The client file never shows it, even with `?debug=1`.
