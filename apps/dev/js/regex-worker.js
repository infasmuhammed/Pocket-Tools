"use strict";

self.addEventListener("message", (event) => {
  const { pattern, flags, text } = event.data || {};
  try {
    const regexFlags = String(flags || "");
    const regex = new RegExp(String(pattern || ""), regexFlags);
    const input = String(text || "");
    const rawMatches = regexFlags.includes("g") ? [...input.matchAll(regex)] : [regex.exec(input)].filter(Boolean);
    const matches = rawMatches.map((match) => ({
      match: match[0],
      index: match.index,
      groups: match.slice(1)
    }));
    self.postMessage({ ok: true, matches });
  } catch (error) {
    self.postMessage({ ok: false, error: error?.message || String(error) });
  }
});
