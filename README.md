# The Shoreditch Way

Shared resources for Shoreditch Design Studio: agent skills, templates and design notes. Deployed on Vercel as a static site; every push to `main` redeploys.

## Install the skills

Works with Claude Code, Codex, Cursor and other agents that read `SKILL.md`:

```sh
npx skills add shoreditchdesign/theshoreditchway -g
```

Install one skill only: add `--skill hoxton-slides`. Pull updates later with `npx skills update`.

For claude.ai, zip the skill folder (e.g. `skills/hoxton-slides/`) and upload it under Settings → Capabilities → Skills.

## Skills

| Skill | What |
|---|---|
| `skills/hoxton-slides/` | Presentation decks as HTML from the Hoxton layout library. Preview: `/skills/hoxton-slides/` |
| `skills/hoxton-codeanimation/` | Explainer and product-walkthrough animations as one HTML/CSS/GSAP file, guided step by step: Figma or Paper frames, script, timeline, HTML rebuild, debug panel, handoff. Preview: `/skills/hoxton-codeanimation/templates/starter.html?debug=1` |

## Adding a skill

Create `skills/<name>/SKILL.md` with `name` and `description` frontmatter, plus any files it needs alongside. Lowercase kebab-case for folders and files; `SKILL.md` and `README.md` stay uppercase because agents and GitHub look for those exact names.
