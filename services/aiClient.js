/**
 * Provider-agnostic AI client for text completion.
 * Wired to Ollama (local) by default.
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE || "http://localhost:11434";
// phi3:mini is fast and small; override with OLLAMA_MODEL (e.g. mistral)
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "phi3:mini";

/**
 * Generate text from a prompt using Ollama.
 * @param {string} prompt - The prompt to send to the model.
 * @param {Object} [options] - Optional settings (e.g. maxTokens, temperature). Reserved for future use.
 * @returns {Promise<string>} The generated text.
 * @throws {Error} If Ollama is unavailable or returns an error.
 */
async function generateText(prompt, options = {}) {
  const url = `${OLLAMA_BASE}/api/generate`;
  const body = {
    model: OLLAMA_MODEL,
    prompt,
    stream: false
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`Ollama request failed (${res.status}): ${msg}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  const text = data.response;
  return typeof text === "string" ? text : "";
}

module.exports = {
  generateText
};
