# Feature: Li.Fi Integration - Execution Guide

## 1. Objective
Enable cross-chain collateral deposits and portfolio rebalancing via the LI.FI SDK. 

> [!IMPORTANT]
> **Coherence Rule**: Refer to `development-master.md` during ALL coding phases to ensure technical alignment with the master plan.

## 2. Technical Specifications (Exact Parity)

### 2.1 CrossChainManager.js
- **Method `depositCollateralFromAnyChain`**:
  - Must use `lifi.getQuote` with `toToken: 'USDC'` on Arc.
  - Must execute `lifi.executeRoute`.
- **Method `rebalancePortfolio`**:
  - Must iterate `portfolio.positions`.
  - Must compare `position.chain` with `targetChain` and execute routes for non-matching chains.

## 3. Implementation Roadmap
1. [ ] **CrossChainManager.js** (SDK logic)
2. [ ] **Integration Tests** (Mock chain responses or local testnet)

## 4. Agent Entry Point
**Current Task**: Logic Implementation.
**Next Action**: Implement `CrossChainManager.js` following the code on lines 880-941 of `development-master.md`.
