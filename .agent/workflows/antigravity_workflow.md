---
description: Workflow for Antigravity-driven development with TDD, verification, and documentation.
---

# Antigravity Development Workflow

This workflow enforces test-driven development, continuous verification, and documentation updates for the DeFi Tokenization Platform.

## 1. Feature Initiation
When starting a new feature or task:
1.  **Read Instructions**: Open `.agent/features/<feature_name>/instructions.md` to understand requirements.
2.  **Check Status**: Open `.agent/features/<feature_name>/status.md` to see what has been done.
3.  **Update Plan**: If necessary, update `implementation_plan.md` (and get user approval if changes are significant).

## 2. Test-Driven Development (TDD) Cycle
**RED**: Write a failing test case for the requirement you are about to implement.
- Create/edit `test/<feature>.test.js`.
- Run the test to confirm it fails: `npx hardhat test test/<feature>.test.js`.

**GREEN**: Write the minimal amount of smart contract or frontend code to pass the test.
- Edit `contracts/<feature>.sol` or `frontend/src/<component>.jsx`.
- Run the test again to confirm it passes.

**REFACTOR**: Clean up the code while ensuring tests still pass.

## 3. Browser Verification (Frontend Only)
For any frontend changes:
1.  **Launch Dev Server**: Run `npm run dev` in the `frontend` directory.
2.  **Verify**: Use the `browser_subagent` to visit `http://localhost:5173` (or appropriate port).
3.  **Interact**: Have the subagent click buttons, fill forms, and verify UI state.
4.  **Screenshot**: Capture proof of functionality.

## 4. Documentation & Git Hygiene
After **EACH** successful "Green" step (passing test):
1.  **Update Status**: Mark the requirement as completed in `.agent/features/<feature_name>/status.md`.
    - Format: `- [x] Requirement Description (Verified by <test_file>)`
2.  **Commit**: Create a git commit with a descriptive message.
    - Format: `feat(<module>): description of change`
    - Example: `feat(core): implement AssetTokenizer minting`
    - **Note**: Commits should be small and atomic.

## 5. Final Verification
Before finishing a feature:
1.  **Run All Tests**: `npx hardhat test` (ensure no regressions).
2.  **Run Verification Script**: `node scripts/verify_plan.js` (ensure meta-compliance).
3.  **Update Task**: Update the main `task.md` to reflect progress.

## 6. Turbo Mode (Auto-Run)
// turbo-all
If you see `// turbo` or `// turbo-all`, you may auto-run commands.
