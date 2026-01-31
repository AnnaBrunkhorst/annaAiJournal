module.exports = {
    generatePrompt(recentEntries = []) {
      if (recentEntries.length === 0) {
        return "How are you feeling right now? You don’t need to write much — even one sentence is enough.";
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
  };
  