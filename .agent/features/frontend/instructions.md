# Feature: Frontend - Execution Guide

## 1. Objective
Build a Cyber-Financial dashboard in React (Vite) as specified in `development-master.md`. 

> [!IMPORTANT]
> **Coherence Rule**: Refer to `development-master.md` during ALL coding phases to ensure technical alignment with the master plan.

## 2. Technical Specifications (Exact Parity)

### 2.1 Dependencies (npm install list)
- `ethers`, `wagmi`, `viem`, `@rainbow-me/rainbowkit`
- `@lifi/widget`, `@lifi/sdk`
- `recharts`, `tailwindcss`, `@tanstack/react-query`

### 2.2 Component Logic
- **LoanCreator.jsx**:
  - Inputs for principal, rate, duration.
  - Conversion: rate * 100 (bps), duration * 86400 (seconds).
- **YellowTrader.jsx**:
  - Side buttons (Buy/Sell).
  - Badge: "⚡ Yellow Network - Instant Settlement".

## 3. Implementation Roadmap
1. [ ] **Scaffold**: Vite (React-TS) + Tailwind.
2. [ ] **Web3**: RainbowKit Setup.
3. [ ] **Pages**: Mint, Loans, Trade, Bridge, Dashboard.

## 4. Agent Entry Point
**Current Task**: Project Scaffolding.
**Next Action**: Run `npx create-vite-app@latest ./ --template react-ts` in `/frontend`. Follow the "Premium" design rules in the root instructions.
