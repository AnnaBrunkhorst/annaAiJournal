const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();
const analysisService = require("../services/analysisService");
const storageService = require("../services/storageService");
const promptService = require("../services/promptService");
const reflectionService = require("../services/reflectionService");

router.get("/prompt", async (req, res) => {
    const noContext = req.query.stub === "1";
    const recentEntries = noContext ? [] : storageService.getRecentEntries(5);
    const { prompt, source } = await promptService.generatePrompt(recentEntries);
    res.json({ prompt, source });
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

function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

function checkOllamaReachable() {
  const base = process.env.OLLAMA_BASE || "http://localhost:11434";
  return fetch(`${base}/api/tags`)
    .then(function (res) {
      return res.ok;
    })
    .catch(function () {
      return false;
    });
}

router.post("/reconnect", async (req, res) => {
  try {
    const reachable = await checkOllamaReachable();
    if (reachable) {
      return res.json({ ok: true });
    }

    const child = spawn("ollama", ["serve"], { detached: true, stdio: "ignore" });
    child.unref();

    const spawnError = await new Promise(function (resolve) {
      child.on("error", function (err) {
        resolve(err);
      });
      child.on("spawn", function () {
        resolve(null);
      });
    });

    if (spawnError) {
      if (spawnError.code === "ENOENT") {
        return res.json({
          ok: false,
          error: "Ollama not found. Install from ollama.com and ensure it's in PATH."
        });
      }
      return res.json({
        ok: false,
        error: spawnError.message || "Could not start Ollama."
      });
    }

    await sleep(2500);
    const nowReachable = await checkOllamaReachable();
    if (nowReachable) {
      return res.json({ ok: true });
    }

    return res.json({
      ok: false,
      error: "Ollama did not start in time. Install from ollama.com and start it manually."
    });
  } catch (err) {
    return res.json({
      ok: false,
      error: err.message || "Could not reconnect to Ollama."
    });
  }
});

module.exports = router;
