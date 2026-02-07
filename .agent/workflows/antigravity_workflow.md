---
description: Workflow for Antigravity-driven development with TDD, verification, and documentation.
---

# Antigravity Development Workflow

This workflow enforces test-driven development, continuous verification, and documentation updates for the DeFi Tokenization Platform.

## 1. Agent Entry Protocol (Resuming or Starting)
Any agent starting work MUST follow these steps exactly:
1.  **Read `development-master.md`**: Establish grounding in the full project scope and the specific technical roadmap.
2.  **Read Root `instructions.md`**: Understand the architecture and dependencies.
3.  **Read Root `status.md`**: Identify which feature modules are "Ready for Work".
4.  **Locate Feature**: Go to `.agent/features/<feature_name>/`.
5.  **Read Feature `instructions.md`**: Follow the "Execution Plan" section.
6.  **Check Feature `status.md`**: Find the first uncompleted task under "Implementation Roadmap".

## 2. Test-Driven Development (TDD) Cycle
**RED**: Write a failing test case for the requirement you are about to implement.
- Create/edit `test/<feature>.test.js`.
- **Constraint**: Tests must be rigorous. No trivial checks. Verify state changes, events, and reverts.
- Run the test to confirm it fails: `npx hardhat test test/<feature>.test.js`.

**GREEN**: Write the minimal amount of smart contract or frontend code to pass the test.
- Edit `contracts/<feature>.sol` or `frontend/src/<component>.jsx`.
- **Constraint**: No placeholders, mocks, or `TODO` comments in source code. Fully implement logic.
- **Constraint**: Adhere to the centralized design system.
- Run the test again to confirm it passes.

**REFACTOR**: Clean up the code while ensuring tests still pass.

## 3. Documentation & Git Hygiene
After **EACH** successful "Green" step (passing test):
1.  **Run Coverage Check**: Run `./scripts/check_coverage.sh` to get test coverage report.
2.  **Update Status**: 
    - Mark the requirement as completed in `.agent/features/<feature_name>/status.md`.
    - Format: `- [x] Requirement Description (Verified by <test_file>)`
    - Update "Next Step for Agent" in the same file.
3.  **Commit**: Create a git commit with a descriptive message.
    - Format: `feat(<module>): description of change`
    - Example: `feat(core): implement AssetTokenizer minting`
    - **Note**: Commits should be small and atomic (one feature point at a time).
4.  **Cascade Update**: check the root `status.md` file. If the feature you just updated is tracked there, mark progress or update the high-level status.

## 4. Final Verification
Before finishing a feature:
1.  **Run All Tests**: `npx hardhat test` (ensure no regressions).
2.  **Run Verification Script**: `node scripts/verify_plan.js` (ensure meta-compliance).
3.  **Update Task**: Update the main `task.md` to reflect progress.

## 5. Turbo Mode (Auto-Run)
// turbo-all
If you see `// turbo` or `// turbo-all`, you may auto-run commands.