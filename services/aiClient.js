/**
 * Provider-agnostic AI client for text completion.
 * No AI provider is wired yet; returns a stub response.
 */

/**
 * Generate text from a prompt.
 * @param {string} prompt - The prompt or message to send to the model.
 * @param {Object} [options] - Optional settings (e.g. maxTokens, temperature). Reserved for future use.
 * @returns {Promise<string>} The generated text.
 */
async function generateText(prompt, options = {}) {
  return "[AI stub] No provider configured. Prompt received.";
}

module.exports = {
  generateText
};
