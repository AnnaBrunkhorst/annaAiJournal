(function () {
  const promptEl = document.getElementById("prompt");
  const entryForm = document.getElementById("entry-form");
  const entryTextarea = document.getElementById("entry");
  const responseEl = document.getElementById("response");

  // Load prompt on page load
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
        fetch("/journal/prompt")
          .then(function (res) {
            if (!res.ok) return;
            return res.json();
          })
          .then(function (data) {
            if (data && data.prompt) promptEl.textContent = data.prompt;
          })
          .catch(function () {});
      })
      .catch(function () {
        responseEl.textContent = "Something went wrong. Try again.";
      });
  });
})();
