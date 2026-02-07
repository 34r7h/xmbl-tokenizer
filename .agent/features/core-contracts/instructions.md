# Feature: Core Contracts - Execution Guide

## 1. Objective
Implement the foundational smart contracts for RWA tokenization and collateralized lending as defined in `development-master.md`. 

> [!IMPORTANT]
> **Coherence Rule**: Refer to `development-master.md` during ALL coding phases to ensure technical alignment with the master plan.

## 2. Technical Specifications (Exact Parity)

### 2.1 AssetTokenizer.sol
- **Inheritance**: `ERC721`, `Ownable`
- **Struct `Asset`**:
  ```solidity
  struct Asset {
      string assetType;      // "real_estate", "invoice", "equipment"
      uint256 valuationUSD;  // Appraised value
      string documentHash;   // IPFS hash of documentation
      address appraiser;     // Who valued this
      uint256 createdAt;
      bool isActive;
  }
  ```
- **State**: `mapping(uint256 => Asset) public assets;`
- **Function**: `tokenizeAsset(string, uint256, string, address)` -> returns `tokenId`. 
  - Must mint NFT and emit `AssetTokenized`.

### 2.2 LoanToken.sol
- **Inheritance**: `ERC20`
- **Constructor**: `constructor(string name, string symbol, uint256 _loanId, uint256 totalSupply)`
- **Function**: `getLoanInfo()` returns `(address loanContract, uint256 loanId)`.

### 2.3 LoanFactory.sol
- **Inheritance**: `ReentrancyGuard`
- **Struct `Loan`**:
  ```solidity
  struct Loan {
      uint256 id;
      address borrower;
      uint256 collateralTokenId;
      uint256 principalUSDC;
      uint256 interestRate; // bps
      uint256 duration; // seconds
      uint256 startTime;
      uint256 totalOwed;
      address loanToken;
      LoanStatus status;
  }
  ```
- **Enum `LoanStatus`**: `Active, Repaid, Defaulted`.
- **Logic**:
  - `createLoan`: Lock NFT (transfer to Factory), deploy `new LoanToken`, transfer USDC to borrower.
  - `repayLoan`: Transfer `totalOwed` USDC from borrower, return NFT.
- **Helper**: Include `toString(uint256)` internal function for token naming.

### 2.4 PortfolioToken.sol
- **Struct `TokenWeight`**: `address token; uint256 weight;` (10000 = 100%).
- **Constructor**: Validates total weight == 10000 and mints total supply to creator.

## 3. Implementation Roadmap
1. [ ] **AssetTokenizer.sol** (RED: `test/AssetTokenizer.test.js`)
2. [ ] **LoanToken.sol**
3. [ ] **LoanFactory.sol** (RED: `test/LoanFactory.test.js` using MockERC20)
4. [ ] **PortfolioToken.sol**

## 4. Agent Entry Point
**Current Task**: Implement `AssetTokenizer.sol`.
**Next Action**: Create `test/AssetTokenizer.test.js` using the test cases from `development-master.md` (lines 476-527).
