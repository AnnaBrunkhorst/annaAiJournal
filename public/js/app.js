(function () {
  const promptEl = document.getElementById("prompt");
  const entryForm = document.getElementById("entry-form");
  const entryTextarea = document.getElementById("entry");
  const weeklyReflectionEl = document.getElementById("weekly-reflection");
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
        const promptText = (entry.prompt || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const text = (entry.text || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const promptBlock = promptText
          ? '<p class="recent-entry-prompt">' + promptText + "</p>"
          : "";
        return (
          '<article class="recent-entry-item">' +
          '<time class="recent-entry-time">' + date + "</time>" +
          promptBlock +
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

  const disclaimerEl = document.getElementById("ai-disclaimer");
  const disclaimerErrorEl = document.getElementById("disclaimer-error");

  function setDisclaimerVisible(visible) {
    disclaimerEl.style.display = visible ? "flex" : "none";
    if (visible) {
      disclaimerErrorEl.style.display = "none";
      disclaimerErrorEl.textContent = "";
    }
  }

  function loadPrompt(noContext) {
    promptEl.textContent = "Loading prompt…";
    const url = noContext ? "/journal/prompt?stub=1" : "/journal/prompt";
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't load prompt");
        return res.json();
      })
      .then(function (data) {
        promptEl.textContent = data.prompt || "How are you feeling right now?";
        setDisclaimerVisible(data.source === "fallback");
      })
      .catch(function () {
        promptEl.textContent = "Couldn't load prompt.";
        setDisclaimerVisible(true);
      });
  }

  loadPrompt();
  loadRecentEntries();

  document.getElementById("regenerate-prompt").addEventListener("click", function () {
    loadPrompt();
  });

  document.getElementById("stub-prompt").addEventListener("click", function () {
    loadPrompt(true);
  });

  document.getElementById("reconnect-ollama").addEventListener("click", function () {
    const btn = this;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Reconnecting…";
    disclaimerErrorEl.style.display = "none";
    disclaimerErrorEl.textContent = "";
    fetch("/journal/reconnect", { method: "POST" })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (data) {
        if (data.ok) {
          loadPrompt();
        } else {
          disclaimerErrorEl.textContent =
            data.error || "Couldn't start Ollama. Install from ollama.com and start it manually.";
          disclaimerErrorEl.style.display = "block";
        }
      })
      .catch(function () {
        disclaimerErrorEl.textContent =
          "Couldn't start Ollama. Install from ollama.com and start it manually.";
        disclaimerErrorEl.style.display = "block";
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = originalText;
      });
  });

  document.getElementById("generate-reflection").addEventListener("click", function () {
    weeklyReflectionEl.textContent = "Loading…";
    fetch("/journal/weekly-reflection")
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't generate reflection");
        return res.json();
      })
      .then(function (data) {
        const text = (data.reflection || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        weeklyReflectionEl.innerHTML = text.replace(/\n/g, "<br>");
      })
      .catch(function () {
        weeklyReflectionEl.textContent = "Couldn't generate reflection. Please try again.";
      });
  });

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
      body: JSON.stringify({
        entry: value,
        prompt: (promptEl.textContent || "").trim() || undefined
      })
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
