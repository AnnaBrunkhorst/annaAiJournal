const aiClient = require("./aiClient");

function formatDate(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function buildWeeklyReflectionPrompt(entries) {
  const now = new Date();
  const currentDate = formatDate(now);

  const outputRule =
    "Output ONLY the reflection text. No preamble, no explanation, no quotation marks, no references to these instructions or prior text.";

  if (!entries || entries.length === 0) {
    return (
      "Provide a gentle, empathetic message encouraging the user to start journaling. " +
      "They have no entries from the past week. Keep it brief and welcoming. " +
      outputRule
    );
  }

  const excerpts = entries
    .map(function (e, i) {
      const text = (e.text || "").trim();
      const truncated = text.length > 300 ? text.slice(0, 300) + "…" : text;
      const written = formatDate(e.timestamp);
      const dateLabel = written ? ` (written ${written})` : "";
      return `Entry ${i + 1}${dateLabel}:\n${truncated}`;
    })
    .join("\n\n");

  return (
    "Based on these journal entries from the past week, provide a gentle summary and reflection. " +
    "Identify any patterns — for example, activities or moments the user associated with positive feelings. " +
    "Note these to the user and, if appropriate, suggest trying such activities again. " +
    "Be empathetic, concise, and encouraging. " +
    outputRule +
    "\n\nCurrent date: " +
    currentDate +
    "\n\nEntries from the past week:\n" +
    excerpts
  );
}

module.exports = {
  async generateWeeklyReflection(entries) {
    try {
      const prompt = buildWeeklyReflectionPrompt(entries);
      const result = await aiClient.generateText(prompt);
      return typeof result === "string" && result.trim()
        ? result.trim()
        : "You haven't written any entries this past week. Consider starting with a small reflection on how you're feeling today.";
    } catch (err) {
      throw err;
    }
  }
};
