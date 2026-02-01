# AI-Powered Journal Companion

A private, empathetic journaling app that helps users overcome "blank page" anxiety and reflect meaningfully on their entries. I built it to run entirely on your machine—journal data and AI prompts stay local—so you can focus on self-reflection without privacy concerns.

---

## Design Choices

### Local-first and privacy

I chose a local-first approach so nothing leaves your device. All entries are stored in a JSON file (`data/entries.json`). The AI runs via [Ollama](https://ollama.com) on your machine; there are no cloud APIs or third-party services by default. There is no authentication or user accounts—it's a single-user, local-use app.

### AI as stateless analyst

The AI is treated as a stateless analyst, not a conversational agent. It receives minimal context: 1–3 recent entry excerpts (truncated), the current date, and each entry's written date. I never send the full journal history—only what's needed for the current prompt or reflection. The `aiClient` service is provider-agnostic so I could later add cloud AI as an optional, configurable backend.

### Robustness and UX

When Ollama isn't running, the app falls back to rule-based prompts. I use keyword detection (stress, work, sad, happy, tired, family, etc.) and random generic prompts when nothing matches. I post-process AI output to extract only the first sentence ending with `?`, which prevents instruction leakage and keeps prompts clean. When the AI is offline, a disclaimer appears with a Reconnect button that attempts to start Ollama.

### Temporal awareness

The current date and each entry's written date are sent to the AI so it can phrase prompts appropriately—e.g. "the other day" instead of "today" when entries are older.

---

## Technical Stack

| Layer       | Technology                                  |
| ----------- | ------------------------------------------- |
| Backend     | Node.js, Express 5                          |
| Frontend    | Vanilla HTML, CSS, JavaScript (no framework)|
| Storage     | JSON file (`data/entries.json`)             |
| AI          | Ollama (local); default model: phi3:mini    |
| Dependencies| express; nodemon (dev)                      |

No database, cloud services, or auth libraries.

---

## Features

- **Dynamic prompts:** AI-generated or rule-based empathetic questions. Context-aware from recent entries and timestamps. "New topic" button for a context-free prompt.
- **Weekly reflection:** AI summary of the past week's entries, with patterns and gentle suggestions.
- **Past entries:** List with date/time and the prompt that led to each entry. "Clear all" for demo purposes.
- **Reconnect:** When the AI is offline, a button attempts to start Ollama.
- **Persistence:** Entries and prompts saved to JSON; they survive server restarts.

---

## Privacy and Trust

- Data never leaves your machine.
- Ollama runs locally; no third-party AI APIs by default.
- Simple, focused UI; no tracking or analytics.
- Transparent when the AI is vs isn't connected.

---

## Getting Started

**Prerequisites:** Node.js (v18+), [Ollama](https://ollama.com) (somewhat optional; the app works without it but prompts will be static and rule-based)

```bash
git clone <repo-url>
cd annaAiJournal
npm install
npm run dev
```

**Optional (for AI prompts):**
```bash
ollama pull phi3:mini
```

Open http://localhost:3000 in your browser.

**Environment (optional):** `OLLAMA_BASE`, `OLLAMA_MODEL`

---

## Future Enhancements

- Sentiment/theme analysis and visual dashboard
- Monthly reflection summaries
- Local user accounts with password protection
- Support for cloud AI (OpenAI, etc.) as an optional, configurable backend
- Improved post-processing and prompt engineering for small models

---

## Success Metrics

- **User engagement:** Dynamic prompts reduce friction; rule-based fallback keeps the app usable when the AI is offline.
- **Insightfulness:** Weekly reflection and context-aware prompts help users notice patterns in their entries.
- **Privacy:** Local-first design; data stays on the user's machine.
- **AI application:** Local LLM for empathetic prompts; minimal context sent per request.
- **Code quality:** Modular services (`promptService`, `reflectionService`, `storageService`, `aiClient`), error handling, and fallbacks throughout.
