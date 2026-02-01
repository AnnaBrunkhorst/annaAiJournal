const express = require("express");
const router = express.Router();
const analysisService = require("../services/analysisService");
const storageService = require("../services/storageService");
const promptService = require("../services/promptService");
const reflectionService = require("../services/reflectionService");

router.get("/prompt", async (req, res) => {
    const noContext = req.query.stub === "1";
    const recentEntries = noContext ? [] : storageService.getRecentEntries(5);
    const prompt = await promptService.generatePrompt(recentEntries);
    res.json({ prompt });
  });  

router.post("/", async (req, res) => {
  const { entry, prompt } = req.body;

  if (!entry) {
    return res.status(400).json({ error: "Entry required" });
  }

  storageService.addEntry(entry, prompt);
  const recentEntries = storageService.getRecentEntries(5);

  const analysis = await analysisService.analyzeEntry(entry, recentEntries);

  res.json({
    message: "Entry received",
    analysis
  });
});

router.get("/recent", (req, res) => {
  const recentEntries = storageService.getRecentEntries(10);
  res.json({ count: recentEntries.length, recentEntries });
});

router.get("/weekly-reflection", async (req, res) => {
  try {
    const entries = storageService.getEntriesFromPastDays(7);
    const reflection = await reflectionService.generateWeeklyReflection(entries);
    res.json({ reflection });
  } catch (err) {
    res.status(500).json({
      reflection: "Couldn't generate reflection. Please try again."
    });
  }
});

router.delete("/entries", (req, res) => {
  storageService.clearAllEntries();
  res.status(200).json({ message: "All entries cleared." });
});

module.exports = router;
