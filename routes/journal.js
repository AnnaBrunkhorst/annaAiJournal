const express = require("express");
const router = express.Router();
const analysisService = require("../services/analysisService");
const storageService = require("../services/storageService");
const promptService = require("../services/promptService");

router.get("/prompt", (req, res) => {
    const recentEntries = storageService.getRecentEntries(5);
    const prompt = promptService.generatePrompt(recentEntries);
  
    res.json({ prompt });
  });  

router.post("/", async (req, res) => {
  const { entry } = req.body;

  if (!entry) {
    return res.status(400).json({ error: "Entry required" });
  }

  storageService.addEntry(entry);
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


module.exports = router;
