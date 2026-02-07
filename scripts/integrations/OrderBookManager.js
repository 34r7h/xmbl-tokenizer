/**
 * @title OrderBookManager
 * @dev Coordinates bridge sessions and off-chain order placement
 */
class OrderBookManager {
  constructor(yellowClient, yellowBridgeContract) {
    this.yellow = yellowClient;
    this.bridge = yellowBridgeContract;
    this.activeOrders = new Map();
  }

  /**
   * @dev Create a limit order by starting a session and placing order off-chain
   */
  async createLimitOrder(token, amount, price, side) {
    // Start Yellow session on-chain
    const tx = await this.bridge.startSession(token, amount);
    const receipt = await tx.wait();
    
    // Extract sessionId from event
    const event = receipt.logs.find(log => {
      try {
        return this.bridge.interface.parseLog(log)?.name === "SessionStarted";
      } catch { return false; }
    });
    const { sessionId } = this.bridge.interface.parseLog(event).args;
    
    // Place off-chain limit order
    const order = await this.yellow.placeOrder(sessionId, {
      type: 'limit',
      pair: `${token}/USDC`,
      side,
      amount,
      price
    });
    
    this.activeOrders.set(order.id, { sessionId, order });
    return order;
  }

  /**
   * @dev Execute a market order with immediate settlement
   */
  async executeMarketOrder(token, amount, side) {
    const tx = await this.bridge.startSession(token, amount);
    const receipt = await tx.wait();
    
    const event = receipt.logs.find(log => {
      try {
        return this.bridge.interface.parseLog(log)?.name === "SessionStarted";
      } catch { return false; }
    });
    const { sessionId } = this.bridge.interface.parseLog(event).args;
    
    const result = await this.yellow.placeOrder(sessionId, {
      type: 'market',
      pair: `${token}/USDC`,
      side,
      amount
    });
    
    // Immediate settlement for market orders
    await this.yellow.settleSession(sessionId);
    return result;
  }

  /**
   * @dev Cancel an order and settle the session
   */
  async cancelOrder(orderId) {
    const orderData = this.activeOrders.get(orderId);
    if (!orderData) throw new Error("Order not found");
    
    const { sessionId } = orderData;
    await this.yellow.placeOrder(sessionId, { type: 'cancel', orderId }); // Simplified cancel
    await this.yellow.settleSession(sessionId);
    this.activeOrders.delete(orderId);
  }
}

module.exports = OrderBookManager;
