#!/usr/bin/env node
/**
 * btw-saver: UserPromptSubmit hook (btw-nudge.js)
 *
 * Detects when the user's last prompt was /btw.
 * On the next prompt, injects a soft reminder into Claude's context so Claude
 * can surface a save suggestion naturally if relevant.
 *
 * Non-blocking: always exits 0. Never outputs directly to the user.
 *
 * State file: ~/.btw-saver-state.json
 */

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");

const STATE_FILE = path.join(os.homedir(), ".btw-saver-state.json");

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { lastWasBtw: false, lastBtwQuestion: "" };
  }
}

function writeState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    // Non-critical — silently ignore write failures
  }
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let event = {};
  try {
    event = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const prompt = (event.prompt || "").trim();
  const state = readState();

  // Current prompt is /btw — record question for next turn
  if (/^\/(btw)\s/i.test(prompt) || prompt.toLowerCase() === "/btw") {
    const question = prompt.replace(/^\/(btw)\s*/i, "").trim();
    writeState({ lastWasBtw: true, lastBtwQuestion: question });
    process.exit(0);
  }

  // User is already saving — clear state, no hint needed
  if (/^\/(btw:save)\b/i.test(prompt)) {
    writeState({ lastWasBtw: false, lastBtwQuestion: "" });
    process.exit(0);
  }

  // Previous prompt was /btw and user has moved on — inject a one-time hint
  if (state.lastWasBtw) {
    writeState({ lastWasBtw: false, lastBtwQuestion: "" });

    const q = state.lastBtwQuestion;
    const saveCmd = q ? `/btw:save ${q}` : "/btw:save <your question>";
    const hint = [
      `[btw-saver] The user just used /btw${q ? ` to ask: "${q}"` : ""}.`,
      `If the answer was useful, you may gently suggest: ${saveCmd}`,
      `Only mention this if it feels natural. Do not interrupt unrelated tasks.`,
    ].join(" ");

    const output = {
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: hint,
      },
    };
    process.stdout.write(JSON.stringify(output));
  }

  process.exit(0);
});
