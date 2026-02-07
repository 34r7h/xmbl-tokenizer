const axios = require('axios');

/**
 * @title StrategyParser
 * @dev Converts natural language user descriptions into structured DeFi strategies using LLMs (Ollama)
 */
class StrategyParser {
  /**
   * @param {string} ollamaUrl - Base URL for the Ollama API
   */
  constructor(ollamaUrl = 'http://localhost:11434') {
    this.ollamaUrl = ollamaUrl;
  }

  /**
   * @dev Convert user intent into a structured JSON strategy
   * @param {string} userDescription - Natural language strategy description
   * @returns {Promise<Object>} - Structured strategy object
   */
  async parseUserIntent(userDescription) {
    const prompt = `
You are a DeFi strategy parser. Convert this user description into a JSON strategy:

User description: "${userDescription}"

Generate a JSON object with:
{
  "type": "rebalancing|arbitrage|hedging|lending",
  "triggers": [{"condition": "...", "threshold": ...}],
  "actions": [{"type": "...", "params": {...}}],
  "constraints": {"maxSlippage": 0.01, "gasLimit": "..."}
}

Only respond with valid JSON.
`;

    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
      model: 'llama2',
      prompt,
      stream: false
    });

    try {
        // Handle both object and string responses from Ollama
        const responseData = typeof response.data.response === 'string' 
            ? JSON.parse(response.data.response) 
            : response.data.response;
        return responseData;
    } catch (error) {
        throw new Error(`Failed to parse LLM response: ${error.message}`);
    }
  }

  /**
   * @dev Suggest optimizations for a given strategy based on market data
   * @param {Object} strategy - The parsed strategy object
   * @param {Object} marketData - Current market data (prices, APYs, etc.)
   * @returns {Promise<Object>} - Optimization suggestions
   */
  async optimizeStrategy(strategy, marketData) {
    const prompt = `
Given this strategy:
${JSON.stringify(strategy, null, 2)}

And market data:
${JSON.stringify(marketData, null, 2)}

Suggest optimizations. Respond with JSON only:
{
  "suggestedChanges": [...],
  "riskScore": 0-100,
  "expectedAPY": "..."
}
`;

    const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
      model: 'llama2',
      prompt,
      stream: false
    });

    try {
        const responseData = typeof response.data.response === 'string' 
            ? JSON.parse(response.data.response) 
            : response.data.response;
        return responseData;
    } catch (error) {
        throw new Error(`Failed to parse LLM optimization: ${error.message}`);
    }
  }
}

module.exports = StrategyParser;
