module.exports = {
    analyzeEntry: async (entry, recentEntries = []) => {
      return {
        sentiment: "neutral",
        themes: ["reflection"],
        summary: `Stub analysis with ${recentEntries.length} recent entries considered.`
      };
    }
  };
  