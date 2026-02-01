const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(process.cwd(), "data");
const ENTRIES_FILE = path.join(DATA_DIR, "entries.json");

let entries = [];

function loadFromFile() {
  try {
    const raw = fs.readFileSync(ENTRIES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    entries = Array.isArray(parsed) ? parsed : [];
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
      text,
      timestamp: new Date(),
      prompt: prompt != null ? prompt : null
    });
    writeToFile();
  },

  getRecentEntries(limit = 5) {
    return entries.slice(-limit);
  },

  clearAllEntries() {
    entries = [];
    writeToFile();
  }
};
