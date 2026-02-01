const aiClient = require("./aiClient");

function buildTaskPrompt(recentEntries) {
  const outputRule =
    "Output ONLY the question itself. No preamble, no explanation, no quotation marks, no references to these instructions or to prior text.";
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
      return `Entry ${i + 1}: ${truncated}`;
    })
    .join("\n\n");
  return (
    "Based on these recent journal entries, generate a single empathetic follow-up question to encourage reflection. " +
    "Keep it brief and conversational. " +
    outputRule +
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
