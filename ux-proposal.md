# UX Improvement Proposal: /btw Answer Persistence in Claude Code

**Author:** Sheng  
**Date:** 2026-05  
**Type:** UX Improvement Proposal + Working Plugin Implementation  
**Audience:** Anthropic Claude Code Design Team

---

## Problem Definition

### The Invisible State Boundary

Claude Code's `/btw` command creates an ephemeral side conversation — a dismissible overlay that answers questions without polluting the main context. When dismissed, the answer disappears permanently.

This design is intentional and correct:

- Keeps the main context lean (no token accumulation)
- Signals that `/btw` is a "margin note, not part of the document"
- Prevents accidental context pollution from exploratory questions

**The gap:** Users have no warning that the answer will disappear until it already has.

---

## User Journey: Where It Breaks

```
User types /btw
       ↓
Overlay appears — looks identical to a normal Claude response
       ↓
User reads the answer
       ↓
User presses Escape (or Space / Enter)
       ↓
Answer gone. No warning. No recovery path.
       ↓
User realizes they wanted to keep it — too late.
```

This maps directly to **Nielsen Heuristic #1: Visibility of System Status.**

The overlay looks and feels like a normal response. There is no visual affordance distinguishing ephemeral content from persistent content. Users cannot tell they are operating inside a temporary, non-persistent context until it is gone.

---

## Who Is Affected

This disproportionately affects:

- **New Claude Code users** who haven't internalized `/btw`'s ephemeral nature
- **Users in deep focus sessions** who ask a `/btw` question mid-task, get a useful answer, then context-switch before saving
- **ADHD-pattern users** — the `/btw` feature was celebrated on Reddit as *"a gift to us Claude Code homies that have the ADHD brain."* This group is most likely to dismiss before saving

---

## Design Principle

> **Ephemeral by default. Persistent by choice.**

The goal is not to make `/btw` persistent — that defeats the purpose. The goal is to give users a clear, low-friction **opt-in to save** at the moment of peak relevance: before dismissal.

---

## Proposed Core Fix (for Anthropic)

### Save Button in the /btw Overlay

Add a "Save" action to the overlay footer alongside the existing dismiss affordance.

**Current:**
```
[Space / Enter / Esc to dismiss]
```

**Proposed:**
```
[Space / Enter / Esc to dismiss]    [S] Save to log
```

**Behavior on Save:**
- Appends the Q&A to `.btw-log/btw-log.md` in the project root
- Brief "Saved ✓" confirmation flash before dismissing
- No interruption to workflow — save then dismiss in one keystroke

**Why this is the right fix:**
- Zero cognitive overhead — the option appears when the answer is visible
- Non-intrusive — default behavior unchanged, opt-in only
- Consistent with the overlay's existing keyboard-driven UX
- Low engineering cost: one keybinding + one file write

### Secondary Option: Dismissal Status Hint

A softer alternative: when Escape is pressed, briefly show a one-line hint in the status bar:

```
/btw answer dismissed · Run /btw:save <question> to recall and save it
```

This adds a recovery path without touching the overlay layout at all.

---

## Limitation of the Plugin Approach

Because `/btw` answers are ephemeral by architecture — they never enter conversation history — **no plugin can capture the exact answer after dismissal.** The plugin in this repo re-generates the answer from the same context, which is functionally equivalent but not byte-identical.

| | Ideal Fix (Save Button) | This Plugin |
|---|---|---|
| Trigger | One keystroke at dismissal | `/btw:save` after dismissal |
| Answer fidelity | Exact | Re-generated (may differ slightly) |
| Friction | Near-zero | Low |
| Requires core change | Yes | No |

The plugin is a meaningful workaround. The save button is the correct long-term solution.

---

## References

- [Claude Code /btw documentation](https://code.claude.com/docs/en/interactive-mode)
- [/btw source analysis — ZhangHanDong](https://gist.github.com/ZhangHanDong/a123f194fc0e68c9d408355bd10746c6)
- [Claude Code Plugins documentation](https://code.claude.com/docs/en/plugins)
- Nielsen Norman Group — 10 Usability Heuristics (#1: Visibility of System Status)
- Reddit r/ClaudeAI — community response to /btw launch, March 2026
