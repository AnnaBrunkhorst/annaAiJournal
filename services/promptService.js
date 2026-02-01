const aiClient = require("./aiClient");

function buildTaskPrompt(recentEntries) {
  if (recentEntries.length === 0) {
    return "Generate a single empathetic journaling question for someone writing their first entry. Keep it brief and welcoming.";
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
    "Keep it brief and conversational.\n\nRecent entries:\n" +
    excerpts
  );
}

module.exports = {
  async generatePrompt(recentEntries = []) {
    try {
      const taskPrompt = buildTaskPrompt(recentEntries);
      const result = await aiClient.generateText(taskPrompt);
      return typeof result === "string" && result.trim()
        ? result.trim()
        : "How are you feeling right now? You don't need to write much — even one sentence is enough.";
    } catch (err) {
      return "How are you feeling right now? You don't need to write much — even one sentence is enough.";
    }
  }
};
