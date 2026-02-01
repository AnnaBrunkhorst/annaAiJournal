(function () {
  const promptEl = document.getElementById("prompt");
  const entryForm = document.getElementById("entry-form");
  const entryTextarea = document.getElementById("entry");
  const responseEl = document.getElementById("response");
  const recentEntriesEl = document.getElementById("recent-entries");

  function renderRecentEntries(entries) {
    if (!entries || entries.length === 0) {
      recentEntriesEl.textContent = "No entries yet.";
      return;
    }
    const reversed = [...entries].reverse();
    recentEntriesEl.innerHTML = reversed
      .map(function (entry) {
        const date = entry.timestamp
          ? new Date(entry.timestamp).toLocaleString()
          : "";
        const text = (entry.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return (
          '<article class="recent-entry-item">' +
          '<time class="recent-entry-time">' + date + "</time>" +
          '<p class="recent-entry-text">' + text + "</p>" +
          "</article>"
        );
      })
      .join("");
  }

  function loadRecentEntries() {
    fetch("/journal/recent")
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't load entries");
        return res.json();
      })
      .then(function (data) {
        renderRecentEntries(data.recentEntries || []);
      })
      .catch(function () {
        recentEntriesEl.textContent = "Couldn't load entries.";
      });
  }

  function loadPrompt() {
    promptEl.textContent = "Loading prompt…";
    fetch("/journal/prompt")
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't load prompt");
        return res.json();
      })
      .then(function (data) {
        promptEl.textContent = data.prompt || "How are you feeling right now?";
      })
      .catch(function () {
        promptEl.textContent = "Couldn't load prompt.";
      });
  }

  loadPrompt();
  loadRecentEntries();

  document.getElementById("clear-entries").addEventListener("click", function () {
    fetch("/journal/entries", { method: "DELETE" })
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't clear entries");
        return res.json();
      })
      .then(function () {
        loadPrompt();
        loadRecentEntries();
        responseEl.textContent = "Your reflection will appear here.";
      })
      .catch(function () {
        recentEntriesEl.textContent = "Couldn't clear entries.";
      });
  });

  // Submit entry
  entryForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = entryTextarea.value.trim();
    if (!value) {
      responseEl.textContent = "Please write something.";
      return;
    }

    responseEl.textContent = "Saving…";

    fetch("/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: value })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (data) {
        const analysis = data.analysis;
        if (!analysis) {
          responseEl.textContent = data.message || "Entry saved.";
        } else {
          const parts = [];
          if (analysis.sentiment) {
            parts.push("Sentiment: " + analysis.sentiment);
          }
          if (analysis.themes && analysis.themes.length) {
            parts.push("Themes: " + analysis.themes.join(", "));
          }
          if (analysis.summary) {
            parts.push(analysis.summary);
          }
          responseEl.innerHTML = parts.join("<br><br>");
          entryTextarea.value = "";
        }

        // Refresh prompt so next session is context-aware
        loadPrompt();

        loadRecentEntries();
      })
      .catch(function () {
        responseEl.textContent = "Something went wrong. Try again.";
      });
  });
})();
