const aiClient = require("./aiClient");

function formatDate(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function buildTaskPrompt(recentEntries) {
  const outputRule =
    "Output ONLY the question itself. No preamble, no explanation, no quotation marks, no references to these instructions or to prior text.";
  const now = new Date();
  const currentDate = formatDate(now);

  if (recentEntries.length === 0) {
    return (
      "Generate a single empathetic journaling question for someone writing their first entry. " +
      "Keep it brief and welcoming. " +
      outputRule
    );
  }

  const excerpts = recentEntries
    .slice(-3)
    .map(function (e, i) {
      const text = (e.text || "").trim();
      const truncated = text.length > 200 ? text.slice(0, 200) + "…" : text;
      const written = formatDate(e.timestamp);
      const dateLabel = written ? ` (written ${written})` : "";
      return `Entry ${i + 1}${dateLabel}: ${truncated}`;
    })
    .join("\n\n");

  return (
    "Based on these recent journal entries, generate a single empathetic follow-up question to encourage reflection. " +
    "Consider when each entry was written relative to today: if the last entry was days or weeks ago, refer to it as 'the other day' or 'a while ago' rather than 'today', or gently shift to a related or fresh topic instead of assuming recent continuity. " +
    "Keep it brief and conversational. " +
    outputRule +
    "\n\nCurrent date: " +
    currentDate +
    "\n\nRecent entries:\n" +
    excerpts
  );
}

const FALLBACK_PROMPTS = [
  "Looking back on today, what stands out most for you?",
  "What's on your mind right now?",
  "Is there something you'd like to reflect on today?",
  "How has your day been so far?",
  "What would you like to write about?"
];

function generateRuleBasedPrompt(recentEntries) {
  if (recentEntries.length === 0) {
    return "How are you feeling right now? You don't need to write much — even one sentence is enough.";
  }

  const lastEntry = recentEntries[recentEntries.length - 1].text.toLowerCase();

  if (lastEntry.includes("stress")) {
    return "You mentioned feeling stressed recently. Was there a moment today that felt a bit lighter?";
  }

  if (lastEntry.includes("work")) {
    return "How did work show up for you today — what felt hardest, and what felt manageable?";
  }

  if (/happy|joy|joyful|grateful|glad|good|great|excited|relieved/.test(lastEntry)) {
    return "You seemed to have a positive moment recently. What made it feel that way, and could you savor or share it somehow?";
  }

  if (/tired|sleep|exhausted|rest/.test(lastEntry)) {
    return "You mentioned rest or fatigue. How are you taking care of yourself today?";
  }

  if (/family|friend|relationship|partner/.test(lastEntry)) {
    return "You wrote about relationships. Is there something you'd like to explore or appreciate about that?";
  }

  const idx = Math.floor(Math.random() * FALLBACK_PROMPTS.length);
  return FALLBACK_PROMPTS[idx];
}

module.exports = {
  async generatePrompt(recentEntries = []) {
    try {
      const taskPrompt = buildTaskPrompt(recentEntries);
      const result = await aiClient.generateText(taskPrompt);
      if (typeof result === "string" && result.trim()) {
        return { prompt: result.trim(), source: "ai" };
      }
      return { prompt: generateRuleBasedPrompt(recentEntries), source: "fallback" };
    } catch (err) {
      return { prompt: generateRuleBasedPrompt(recentEntries), source: "fallback" };
    }
  }
};
