# Feature: AI Agents - Execution Guide

## 1. Objective
Implement automated strategy parsing and execution using Ollama and AgentExecutor. 

> [!IMPORTANT]
> **Coherence Rule**: Refer to `development-master.md` during ALL coding phases to ensure technical alignment with the master plan.

## 2. Technical Specifications (Exact Parity)

### 2.1 StrategyParser.js
- **Method `parseUserIntent`**:
  - Must use the specific prompt: "Convert this user description into a JSON strategy... Generate a JSON object with: type, triggers, actions, constraints."
- **Method `optimizeStrategy`**:
  - Must use the prompt: "Suggest optimizations... Respond with JSON only: suggestedChanges, riskScore, expectedAPY."

### 2.2 AgentExecutor.sol
- **Struct `Strategy`**: `id`, `owner`, `strategyType`, `isActive`, `lastExecuted`.
- **Functions**:
  - `registerStrategy(string strategyType, bytes strategyData)`
  - `executeStrategy(bytes32 strategyId, bytes actionData)`

## 3. Implementation Roadmap
1. [ ] **AgentExecutor.sol** (On-chain registry)
2. [ ] **StrategyParser.js** (Ollama Interface)

## 4. Agent Entry Point
**Current Task**: Contract development.
**Next Action**: Implement `AgentExecutor.sol` following the code on lines 1017-1076 of `development-master.md`.
