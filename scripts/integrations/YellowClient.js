/**
 * @title YellowClient
 * @dev SDK wrapper for Yellow Network interactions
 */
class YellowClient {
  constructor(sdk) {
    // Expects a YellowSDK instance
    this.sdk = sdk;
  }

  /**
   * @dev Create a trading session on Yellow Network
   * @param {string} token - Token address
   * @param {number} amount - Amount to lock
   * @returns {Promise<Object>} - Session object
   */
  async createSession(token, amount) {
    if (amount <= 0) throw new Error("Invalid amount");

    // Create wallet session with 10% maxPerTrade allowance
    const session = await this.sdk.createSession({
      token,
      amount,
      allowances: {
        trading: true,
        maxPerTrade: amount * 0.1
      }
    });
    
    return session;
  }

  /**
   * @dev Place an off-chain order on Yellow Network
   * @param {string} sessionId - Unique session identifier
   * @param {Object} order - Order details { type, pair, side, amount, price }
   * @returns {Promise<Object>} - Trade result
   */
  async placeOrder(sessionId, order) {
    if (!sessionId) throw new Error("Session ID required");
    
    const result = await this.sdk.trade({
      sessionId,
      type: order.type, // 'market' or 'limit'
      pair: order.pair,
      side: order.side, // 'buy' or 'sell'
      amount: order.amount,
      price: order.price
    });
    
    return result;
  }

  /**
   * @dev Settle a session on-chain
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<Object>} - Settlement receipt
   */
  async settleSession(sessionId) {
    if (!sessionId) throw new Error("Session ID required");
    
    const settlement = await this.sdk.settleSession(sessionId);
    return settlement;
  }
}

module.exports = YellowClient;
