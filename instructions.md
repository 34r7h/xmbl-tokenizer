# DeFi Tokenization Platform - Master Development Instructions

## 1. Project Overview & Philosophy
This platform is a high-fidelity DeFi ecosystem built on **Arc Network**, **Yellow Network**, and **LI.FI**. It follows a **Meta-Tokenization** philosophy where everything (assets, loans, insurance, portfolios) is a composable token.

## Command Center: DeFi Tokenization Platform

### 1. Executive Summary
This project tokenizes Real-World Assets (RWAs) into collateralized loans, enables gas-free trading via Yellow Network, and manages cross-chain liquidity via LI.FI. 
**Parity Note**: This implementation strictly follows the `development-master.md` technical specification.

### 2. Agent Resume/Start Protocol (CRITICAL)
1.  **Check Overall Progress**: See `status.md` to identify the current module under development.
2.  **Verify Setup**: Run `node scripts/verify_plan.js`.
3.  **Select Feature**: Navigate to `.agent/features/<feature>/`.
4.  **Execute**: Follow the Step-by-Step implementation inside. All technical signatures and logic are derived directly from `development-master.md`.

### 3. System Architecture
- **Settlement**: Arc Network (USDC).
- **Trading**: Yellow Network (Off-chain sessions).
- **Liquidity**: LI.FI (Cross-chain routing).
- **Agents**: Ollama (Strategy parsing).

### 4. Global Rules
- **No Placeholders**: Functional code only.
- **TDD Rigor**: Every feature must have a corresponding passing test.
- **Master Doc Parity**: When in doubt, strictly prefer the implementation details in `development-master.md`.

### 5. Centralized Design System
- **Contracts**: Follow OpenZeppelin standards. Use `SafeERC20` for all transfers. Use `ReentrancyGuard` for state-changing functions.
- **Frontend**: Adhere to the "Cyber-Financial" spec in `.agent/features/frontend/instructions.md`.
- **Naming**: Use camelCase for methods, PascalCase for Contracts, and SCREAMING_SNAKE_CASE for constants.

---

## 2. Parallel vs. Sequential Development Flow

### 2.1 Sequential Dependencies
While features are developed in modular folders, the follow graph defines the implementation order:
1.  **Core Contracts (Foundation)**: Must implement `AssetTokenizer` and `LoanToken` before any integration logic.
2.  **Yellow/Li.Fi/Agents**: Can be developed in parallel **after** the Core interfaces are stabilized.
3.  **Frontend**: Can be developed in parallel using testnet contracts or local deployment addresses.

### 2.2 Parallel Work Rules
When working on multiple features simultaneously:
- **Branching**: Use feature-specific branches if using Git (`feat/core`, `feat/yellow`).
- **Isolation**: Never modify `/contracts/core/` while working on `/contracts/integrations/` unless updating an interface.
- **Mocking**: If a dependency (e.g., `YellowBridge`) is not ready, use an abstract interface defined in the dependee's folder.

---

## 3. Progress Tracking & Cascading Status
We use a **Cascading Documentation** system to ensure the User and Agents are always in sync.

### 3.1 Tracking Tiers
1.  **Tier 1: Feature Status (`.agent/features/<feature>/status.md`)**
    - The most granular level. Updated every time a TDD "Green" step is completed.
    - Contains specific verification file paths (e.g., `Verified by test/core.test.js`).
2.  **Tier 2: Root Status (`/status.md`)**
    - The high-level dashboard. Updated after a feature-level checkbox is marked.
    - Tracks overall module health and integration readiness.
3.  **Tier 3: Plan Status (`/implementation_plan.md`)**
    - Used for roadmap alignment. Updated when a major milestone is hit.

### 3.2 Cascading Update Algorithm
After every successful commit:
1.  Check if the feature-level `status.md` needs a checkbox.
2.  Open the root `status.md`.
3.  Increment the module progress counter (e.g., `1/4 Implemented`).
4.  Highlight the next immediate dependency in the root status.

---

## 4. Integration Matrix
| Module | Depends On | Provides |
| :--- | :--- | :--- |
| Core | None | Asset/Loan Tokens |
| Yellow | Core | Gas-free Trading Sessions |
| Li.Fi | Core | Cross-chain Collateral |
| AI Agents | Core, Yellow, Li.Fi | Automated Strategies |
| Frontend | All Modules | User Interface |

---

## 5. Quality & Verification Gates
### 5.1 Pre-Commit Checklist
- [ ] No `TODO` or `PLACEHOLDER` in any source file.
- [ ] `scripts/check_coverage.sh` returns 100% for the modified files.
- [ ] `node scripts/verify_plan.js` passes.
- [ ] All tests in `test/` pass.

### 5.2 Verification Script
Always run `node scripts/verify_plan.js` to ensure the folder structure and documentation status files are consistent with this instruction set.
