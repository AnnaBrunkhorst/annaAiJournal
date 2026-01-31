const entries = [];

module.exports = {
  addEntry(text) {
    entries.push({
      text,
      timestamp: new Date()
    });
  },

  getRecentEntries(limit = 5) {
    return entries.slice(-limit);
  }
};
