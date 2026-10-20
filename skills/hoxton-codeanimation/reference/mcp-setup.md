# Design-file MCP setup

The rebuild reads the design file through an MCP server: Figma's or Paper's. If the one the user needs isn't connected, set it up for them. Don't hand them a list of instructions and stop.

## 1. Check what's connected

- Claude Code: look for `mcp__figma__*` / `mcp__plugin_figma_figma__*` or `mcp__paper__*` tools, or run `claude mcp list` in Bash.
- Connected but failing (e.g. `ECONNREFUSED`): it's configured, just not reachable. For Paper that almost always means the app isn't open. Ask the user to open it, then reconnect with `/mcp`.
- Not listed at all: install it (below).

Tell the user what you found in one line before changing anything, and that you're about to add an MCP server to their Claude Code config.

## 2. Figma

Figma's remote MCP server. Needs a Figma account with access to the file.

**Install** (Claude Code, run it yourself in Bash):

```sh
claude mcp add --transport http --scope user figma https://mcp.figma.com/mcp
```

Or, if the user prefers the official plugin (adds Figma skills too), ask them to run `/plugin install figma@claude-plugins-official`. Slash commands have to be typed by the user.

**Sign in:** the server needs OAuth. Ask the user to run `/mcp`, pick `figma`, and choose Authenticate. If you get an auth URL from a tool instead, open it for them with `open "<url>"` (macOS) rather than printing it. Tell them to finish in the browser and not to exit the session until it says connected.

**Check:** call `whoami`. Then `get_metadata` on the frame link they gave you.

Tools used in this skill: `get_screenshot`, `get_metadata`, `get_design_context`, `get_variable_defs`.

## 3. Paper

Paper's MCP server runs inside the Paper desktop app, on the user's machine. No account sign-in for the MCP, but **the app must be open with the file loaded** whenever you call it.

**Install** (Claude Code, run it yourself in Bash):

```sh
claude mcp add --transport http --scope user paper http://127.0.0.1:29979/mcp
```

`29979` is Paper's default port. If it doesn't connect, ask the user to check the MCP address in Paper's settings and re-add with that one (`claude mcp remove paper` first).

**Check:** call `get_tree_summary` on the artboard the user linked. If it fails, ask the user to confirm Paper is open, then `/mcp` to reconnect.

Tools used in this skill: `get_screenshot`, `get_tree_summary`, `get_jsx`, `get_children`, `find_nodes`, `get_node_info`, `get_computed_styles`, `get_font_family_info`, `export`.

## 4. After installing

New MCP servers load when a session starts. If the tools don't appear after `/mcp`, tell the user:

1. Exit with `/exit`.
2. Restart with `claude --continue` in the same folder. That reopens this conversation with the new tools loaded.

Say where you'll pick up (e.g. "we'll carry on at step 4, the rebuild").

## Other agents

Cursor, Codex and other agents take the same servers in their own MCP config. The entries are:

```json
{
  "mcpServers": {
    "figma": { "type": "http", "url": "https://mcp.figma.com/mcp" },
    "paper": { "type": "http", "url": "http://127.0.0.1:29979/mcp" }
  }
}
```

Edit the user's config file for them if you can reach it; otherwise give them the exact file path and snippet.
