(function () {
  const promptEl = document.getElementById("prompt");
  const entryForm = document.getElementById("entry-form");
  const entryTextarea = document.getElementById("entry");
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
      return;
    }

    fetch("/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: value })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function () {
        entryTextarea.value = "";
        loadPrompt();
        loadRecentEntries();
      })
      .catch(function () {
        // Silent fail - entry may still have been saved
      });
  });
})();
