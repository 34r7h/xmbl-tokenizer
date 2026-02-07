# Feature: Yellow Integration - Execution Guide

## 1. Objective
Enable gas-free trading of loan tokens via Yellow Network state channels. 

> [!IMPORTANT]
> **Coherence Rule**: Refer to `development-master.md` during ALL coding phases to ensure technical alignment with the master plan.

## 2. Technical Specifications (Exact Parity)

### 2.1 YellowBridge.sol
- **Struct `Session`**: `user`, `depositedAmount`, `token`, `startTime`, `isActive`.
- **Functions**:
  - `startSession(address token, uint256 amount)`: Locks tokens, generates `keccak256(msg.sender, token, block.timestamp)` sessionId.
  - `settleSession(bytes32 sessionId, uint256 finalBalance)`: Returns `finalBalance` to user.

### 2.2 YellowClient.js
- **Methods**:
  - `createSession(token, amount)`: Uses `sdk.createSession` with 10% `maxPerTrade` allowance.
  - `placeOrder(sessionId, order)`: Wraps `sdk.trade` for `market` or `limit` types.
  - `settleSession(sessionId)`: Wraps `sdk.settleSession`.

### 2.3 OrderBookManager.js
- **Methods**:
  - `createLimitOrder`: Chain `bridge.startSession` -> `yellow.placeOrder`.
  - `executeMarketOrder`: Chain `bridge.startSession` -> `yellow.placeOrder` -> `yellow.settleSession`.

## 3. Implementation Roadmap
1. [ ] **YellowBridge.sol** (RED: `test/YellowBridge.test.js`)
2. [ ] **YellowClient.js**
3. [ ] **OrderBookManager.js**

## 4. Agent Entry Point
**Current Task**: Preparing for integration.
**Next Action**: Implement `YellowBridge.sol` following the logic on lines 413-472 of `development-master.md`.
