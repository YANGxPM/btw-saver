# Case Study: btw-saver
## Fixing the Invisible State Boundary in Claude Code's /btw Feature

**Role:** UX Designer + AI PM  
**Type:** Solo project — Research, UX Design, Plugin Implementation  
**Timeline:** 2026-05  
**Deliverables:** UX Proposal, Working Claude Code Plugin, GitHub Release

---

## Overview

Claude Code's `/btw` command lets developers ask side questions without polluting the main conversation context. It's a well-loved feature. But when the overlay is dismissed, the answer disappears permanently — with no warning.

I identified this as a system state visibility failure, designed a core fix proposal for Anthropic, and shipped a working plugin as a best-effort workaround.

---

## The Problem

I discovered the issue firsthand while using Claude Code. I asked a `/btw` question, got a useful answer, pressed Escape — and it was gone. No warning. No recovery path.

My first instinct was: *is this a bug?* After investigating the architecture, I confirmed it was intentional — but the user experience of that moment was broken regardless of intent.

The root cause: **the overlay looks and feels identical to a normal Claude response.** There is no visual affordance distinguishing ephemeral content from persistent content. Users have no way to know they're operating inside a temporary, non-persistent context until it's too late.

This maps directly to **Nielsen Heuristic #1: Visibility of System Status.**

---

## Who Is Affected

I identified three user segments most likely to experience this as a real pain point:

**New Claude Code users** who haven't yet internalized `/btw`'s ephemeral nature. For them, every response looks the same — they have no mental model for "this one disappears."

**Deep-focus developers** who ask a `/btw` question mid-task, get a valuable answer, then context-switch before saving. The cognitive load of active work makes it easy to forget.

**ADHD-pattern users** — notably, when `/btw` launched, the Reddit response included comments like *"this is a gift for us Claude Code homies that have the ADHD brain."* The feature is celebrated precisely by users most likely to forget to save before dismissing.

---

## Design Constraints

Before jumping to solutions, I mapped the constraints:

**Architectural constraint:** `/btw` answers never enter conversation history by design. This means no plugin can capture the exact answer after dismissal — it can only re-generate it.

**Plugin API constraint:** Claude Code's hook system (as of May 2026) has no `/btw`-specific lifecycle event. There is no `onBtwDismiss` hook to intercept. The best available hook is `UserPromptSubmit`, which fires on the next user message.

**UX constraint:** The fix must not change `/btw`'s default behavior. The feature's value comes from being lightweight and non-intrusive. Any solution that adds friction to the default path would be worse than the problem.

---

## Design Principle

> **Ephemeral by default. Persistent by choice.**

The goal is not to make `/btw` persistent. The goal is to give users a clear, low-friction opt-in to save — at the moment of peak relevance, before dismissal.

---

## Solution: Two Layers

### Layer 1 — Core Fix Proposal (for Anthropic)

The ideal solution requires a small change to Claude Code's overlay component: a Save button in the footer.

**Current overlay footer:**
```
[Space / Enter / Esc to dismiss]
```

**Proposed:**
```
[Space / Enter / Esc to dismiss]    [S] Save to log
```

One keystroke. Appends the Q&A to `.btw-log/btw-log.md` in the project root. Confirms with a "Saved ✓" flash and dismisses.

This solution has near-zero cognitive overhead, zero change to default behavior, and low engineering cost. It solves the problem at the correct layer — inside the overlay, at the moment of peak relevance.

### Layer 2 — Plugin Workaround (shipped)

Since the core fix requires Anthropic to act, I built a Claude Code plugin as a best-effort alternative.

**`/btw:save <question>`**

Re-answers the `/btw` question using the current session context and saves the result to `.btw-log/btw-log.md` with a timestamp. The answer may differ slightly from the original — re-generation is the only option given the architectural constraint.

**`UserPromptSubmit` hook**

Detects when the user's last prompt was `/btw`. On the next prompt, silently injects a soft reminder into Claude's context: *"The user just used /btw — if the answer was useful, you may suggest /btw:save."* Claude decides whether to surface this based on conversational context. Non-blocking, never shown directly to the user.

---

## Key Design Decision: Command Naming

The first implementation used `/btw-saver:save-btw` — 19 characters vs `/btw`'s 4. This was clearly wrong.

I worked through two options:

**Option A:** Rename the plugin to `btw` → command becomes `/btw:save` (9 characters, namespaced)

**Option B:** Standalone skill at `~/.claude/skills/` → command becomes `/save-btw` (10 characters, no namespace)

I ultimately chose **Option A** as the reliable path. Option B required an undocumented directory convention I couldn't verify — I chose not to ship a solution built on an assumption I couldn't confirm.

This decision reflects a broader principle I hold as an AI PM: **shipping something honest and slightly less elegant is better than shipping something polished that doesn't work.**

---

## Tradeoffs

| | Ideal (Save Button) | This Plugin |
|---|---|---|
| Trigger | One keystroke at dismissal | `/btw:save` after dismissal |
| Answer fidelity | Exact | Re-generated (may differ) |
| Friction | Near-zero | Low |
| Requires core change | Yes | No |
| Ships today | No | Yes |

---

## Reflection

This project started as a personal frustration and became a product case study in under a day. A few things I'd do differently:

**User research before building.** I identified affected user segments through inference, not interviews. A quick round of user interviews with Claude Code power users would either validate the pain or reveal that most people don't actually care — both are useful signals.

**Explore the overlay mock before the plugin.** I spent more time on the plugin implementation than on the design proposal. For a Portfolio piece targeting a design role, the Figma mockup of the overlay change would have been more persuasive than working Node.js code. The order should have been reversed.

**Validate plugin API assumptions early.** I generated an install path (`~/.claude/skills/`) that turned out to be undocumented and unreliable. Running a quick technical spike before writing the README would have saved a full iteration cycle.

---

## What This Demonstrates

- Identifying a UX failure in a live product and articulating it precisely (Nielsen mapping, user segmentation, root cause vs. symptom)
- Operating within real constraints — architectural, API, and UX — rather than designing in a vacuum
- Shipping a working artifact, not just a proposal
- Being honest about what doesn't work and why, including my own process mistakes

---

## Links

- [GitHub 仓库](https://github.com/your-username/btw-saver)
- [UX改进提案](./UX-Proposal_zh.md)
- [UX Improvement Proposal](./UX-Proposal.md)
- [案例研究](./Case-Study_zh.md)
- [Case Study](./Case-Study.md)
