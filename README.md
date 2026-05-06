# btw-saver

> A Claude Code plugin that solves the disappearing `/btw` answer problem.

---

## The Problem

Claude Code's `/btw` command lets you ask side questions without polluting the main context. When you dismiss the overlay, **the answer is gone permanently** — with no warning before it disappears.

This plugin gives you a recovery path.

---

## What It Does

### `/btw:save <question>`

Re-answers your `/btw` question using the current session context and saves the result to `.btw-log/btw-log.md` in your project.

```
/btw:save what was the name of that config file we read earlier?
```

Saved to `.btw-log/btw-log.md`:

```markdown
---
## [2026-05-05 14:32] what was the name of that config file we read earlier?

The file was `src/config/database.ts`. We read it when analyzing the Redis
connection setup in the authentication module.
```

### Smart Nudge Hook

After you use `/btw`, the `UserPromptSubmit` hook detects this and silently injects a reminder into Claude's context on your next prompt — so Claude can suggest saving if the answer seemed worth keeping.

---

## Install

**Step 1: Clone the repo**

```bash
git clone https://github.com/your-username/btw-saver.git ~/.claude/plugins/btw-saver
```

**Step 2: Fix the hook path**

```bash
sed -i '' 's|PLUGIN_ABSOLUTE_PATH|'"$HOME"'/.claude/plugins/btw-saver|g' \
  ~/.claude/plugins/btw-saver/hooks/hooks.json
```

**Step 3: Register in settings**

Add to `~/.claude/settings.json`:

```json
{
  "plugins": [
    {
      "type": "local",
      "path": "/Users/YOUR_USERNAME/.claude/plugins/btw-saver"
    }
  ]
}
```

> Use an absolute path — `~` may not expand correctly in all environments.

**Step 4: Restart Claude Code**

Run `/reload-plugins` inside Claude Code, then try:

```
/btw:save what was the name of that config file we read earlier?
```

---

## Usage

| Scenario | Command |
|---|---|
| Just dismissed `/btw`, want the answer back | `/btw:save <your question>` |
| Review all saved answers | `cat .btw-log/btw-log.md` |
| Clear the log | `rm .btw-log/btw-log.md` |

---

## Limitations

- **Answer fidelity:** `/btw:save` re-generates the answer — it may differ slightly from what appeared in the overlay. This is a fundamental architectural constraint: `/btw` answers never enter conversation history, so exact capture after dismissal is impossible.
- **Node.js required:** The nudge hook requires Node.js to be installed.
- **Absolute path in hook:** The `sed` command during install sets the correct path. If the hook fails, verify the path in `hooks/hooks.json` manually.

---

## Design Proposal

The ideal fix is a **Save button inside the `/btw` overlay itself** — one keystroke at the moment of peak relevance, before dismissal. This plugin is the best-effort workaround while that change isn't in Claude Code core.

See [`design/ux-proposal.md`](./design/ux-proposal.md) for the full UX analysis and proposal addressed to the Anthropic design team.

---

## File Structure

```
btw-saver/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (name: "btw" → /btw:save)
├── skills/
│   └── save-btw/
│       └── SKILL.md         # Skill definition
├── hooks/
│   └── hooks.json           # UserPromptSubmit hook config
├── scripts/
│   └── btw-nudge.js         # Hook implementation (Node.js)
├── design/
│   └── ux-proposal.md       # UX improvement proposal for Anthropic
└── README.md
```

---

## Author

Built by Sheng, a UX + AI PM.  

---

## License

MIT
