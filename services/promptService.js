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

  return "Looking back on today, what stands out most for you?";
}

module.exports = {
  async generatePrompt(recentEntries = []) {
    try {
      const taskPrompt = buildTaskPrompt(recentEntries);
      const result = await aiClient.generateText(taskPrompt);
      return typeof result === "string" && result.trim()
        ? result.trim()
        : generateRuleBasedPrompt(recentEntries);
    } catch (err) {
      return generateRuleBasedPrompt(recentEntries);
    }
  }
};
