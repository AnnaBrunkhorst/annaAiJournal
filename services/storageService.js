const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const ENTRIES_FILE = path.join(DATA_DIR, "entries.json");

let entries = [];

function loadFromFile() {
  try {
    const raw = fs.readFileSync(ENTRIES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : [];
    entries = list.map(function (e, i) {
      return Object.assign({}, e, { id: e.id || "legacy_" + i });
    });
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn("storageService: could not load entries file", err.message);
    }
    entries = [];
  }
}

function writeToFile() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ENTRIES_FILE, JSON.stringify(entries, null, 2), "utf8");
  } catch (err) {
    console.warn("storageService: could not write entries file", err.message);
  }
}

loadFromFile();

module.exports = {
  addEntry(text, prompt) {
    entries.push({
      id: Date.now() + "_" + Math.random().toString(36).slice(2),
      text,
      timestamp: new Date(),
      prompt: prompt != null ? prompt : null
    });
    writeToFile();
  },

  deleteEntry(id) {
    const before = entries.length;
    entries = entries.filter(function (e) {
      return e.id !== id;
    });
    if (entries.length < before) {
      writeToFile();
      return true;
    }
    return false;
  },

  getRecentEntries(limit = 5) {
    return entries.slice(-limit);
  },

  getEntriesFromPastDays(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return entries.filter(function (e) {
      const d = e.timestamp ? new Date(e.timestamp) : null;
      return d && d >= cutoff;
    });
  },

  clearAllEntries() {
    entries = [];
    writeToFile();
  }
};
