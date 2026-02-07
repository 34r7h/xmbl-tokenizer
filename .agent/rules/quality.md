---
trigger: always_on
---

# Strict Quality Standards & Rules

## 1. No Placeholders or Mocks in Source Code
- **Rule**: All source code files (contracts, frontend components, scripts) must be fully implemented.
- **Forbidden**: Placeholders like `// TODO: implement logic`, `return true; // mocking validation`, `dummyData`, or minimal stubs unless explicitly requested for an API interface.
- **Enforcement**: Code reviews (self-review by agent) must reject any files with temporary logic.

## 2. Centralized System Compliance
- **Rule**: All code and design must adhere to the centralized system:
    - **Smart Contacts**: Follow standard patterns defined in `contracts/core/`.
    - **Frontend**: Use a single UI kit/design system (e.g., specific Tailwind classes, component library). Avoid ad-hoc styling.
    - **Agent**: Follow the `.agent/features/` structure rigorously.
- **Enforcement**: Check against existing patterns before creating new ones.

## 3. Rigorous Testing
- **Rule**: Tests must verify logic, state changes, and edge cases.
- **Forbidden**: Trivial tests like `expect(true).to.be.true`, checking only for non-reversion without verifying state updates, or ignoring error conditions.
- **Requirement**: Use fuzzing or property-based testing where possible.

## 4. Full Coverage Mandate
- **Rule**: Every change must be accompanied by tests that cover the new lines.
- **Enforcement**: The `scripts/check_coverage.sh` script must be run before any commit. 
- **Target**: 100% coverage for smart contracts; high coverage for critical frontend logic.

## 5. Coherence
- mandatory referencing of development-master.md to maintain alignment with project goals.
