# Animation Timeline — Source of Truth

<!--
Built from script.md + the design file (Figma or Paper) + the motion-design skill.
Write this BEFORE any CSS/JS. Every beat gets an exact ms, element, duration
and easing. When a timing tweak lands in code, update this file in the same
change so it never drifts from the build.

Times are ms relative to each scene's own start (t=0 = scene begins).
Coordinates are x,y in .stage space (<W>×<H>, the full video frame, matches index.html).
Cursor coordinates may be relative to the app window inside it; say which.
Flag open questions with 🟡 and recap them at the bottom.
-->

## Motion Identity (all scenes)

**Personality: Corporate** (0–5% overshoot ceiling). Exceptions, if any: <list the hero moments>.

### Easing tokens

```css
--ease-standard:   cubic-bezier(.2, 0, 0, 1);              /* on-screen moves, cursor travel */
--ease-emphasized: cubic-bezier(.05, .7, .1, 1);           /* entrances, hero reveals */
--ease-exit:       cubic-bezier(.3, 0, 1, 1);              /* exits, departures */
--ease-float:      cubic-bezier(.4, 0, .2, 1);             /* floating/dragged objects */
--ease-settle:     cubic-bezier(.175, .885, .32, 1.275);   /* punctuation only, 2–5% overshoot */
```

Matching GSAP names: `std`, `emp`, `exit`, `float`, `settle`.

### Duration tiers

| Tier | ms | Used for |
|---|---|---|
| quick | 200 | click press/release halves |
| standard | 280–320 | element entrances, popups |
| slow | 450 | layout pushes, panel dissolve |
| dramatic | 700–900 | count-ups, mask reveals, hero flights |

### Global rules

- **Click bounce** (every click): scale `1 → 0.85 (90ms, std) → 1.08 (110ms, settle) → 1.0 (100ms, std)`. 300ms total.
- **Cursor travel**: base 300ms scaled by distance (50px 0.8x, 100px 1.0x, 200px 1.3x, 300px 1.5x, 400px 1.6x, full stage 1.8–2.0x), `std`, 10–15px arc at the midpoint for anything over ~100px.
- **Nav active state**: crossfade in over 220ms `std`, starting when the click press bottoms out (~90ms into the bounce).
- **Scene exit**: content dissolves `opacity 1→0` 250ms `exit`. The cursor goes straight to the next scene's nav item in one arc. No detour back to a rest point.
- **Panel swap** fires on cursor arrival/click, not at the scene label (the label marks the start of travel).
- **Combined transforms**: position, scale and rotation start together; rotation may resolve ~100ms early. Never sequential steps.
- **Exits**: opacity faster than translate, fly toward the frame edges, light stagger (~80ms).
- Entrances `emp`, exits `exit`, held motion `std`. No linear except ambient loops.

### Cursor anchor points

| Name | x,y | Used for |
|---|---|---|
| stage-center | <x,y> | opening only |
| rest | <x,y> | loop seam only (end of last scene, start of first) |
| nav-<item> | <x,y> | each nav item centre |

---

## Scene 1 — <Name>

Total: **≈<n>ms**. <On target / over and why.>

Resolved: <interpretive calls confirmed with the user.>

| t (ms) | Element | Action | Dur | Easing | Notes |
|---|---|---|---|---|---|
| 0–200 | `.cursor` | fade in at stage-center | 200 | std | |
| 200–680 | `.cursor` | travel stage-center → nav-<item> (454px) | 480 | std | 15px arc |
| 680–980 | `.cursor` | click bounce | 300 | global | |
| 770–990 | `.nav-item[data-nav=<item>]` | active crossfade | 220 | std | starts at press-bottom |
| ... | | | | | |

---

## Open questions recap

1. 🟡 <question, the default you picked, the alternative>

Total runtime: **≈<sum>s**.
