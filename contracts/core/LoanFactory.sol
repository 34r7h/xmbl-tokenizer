// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./LoanToken.sol";
import "./AssetTokenizer.sol";

/**
 * @title LoanFactory
 * @dev Creates collateralized loans settled in USDC on Arc
 * @notice Manages the full lifecycle: create, repay, and track loans
 */
contract LoanFactory is ReentrancyGuard {
    struct Loan {
        uint256 id;
        address borrower;
        uint256 collateralTokenId;  // RWA NFT
        uint256 principalUSDC;
        uint256 interestRate;        // Basis points (e.g., 500 = 5%)
        uint256 duration;            // Seconds
        uint256 startTime;
        uint256 totalOwed;
        address loanToken;           // ERC-20 for this loan
        LoanStatus status;
    }

    enum LoanStatus { Active, Repaid, Defaulted }

    IERC20 public immutable USDC;
    AssetTokenizer public immutable assetTokenizer;

    uint256 private _loanIdCounter;
    mapping(uint256 => Loan) public loans;
    mapping(address => uint256[]) public borrowerLoans;

    event LoanCreated(uint256 indexed loanId, address indexed borrower, uint256 principal);
    event LoanRepaid(uint256 indexed loanId, uint256 amountPaid);
    event LoanDefaulted(uint256 indexed loanId);

    constructor(address _usdc, address _assetTokenizer) {
        USDC = IERC20(_usdc);
        assetTokenizer = AssetTokenizer(_assetTokenizer);
    }

    /**
     * @dev Creates a new collateralized loan
     * @param collateralTokenId The RWA NFT to use as collateral
     * @param principalUSDC Amount to borrow in USDC
     * @param interestRate Interest rate in basis points (500 = 5%)
     * @param duration Loan duration in seconds
     * @return loanId The ID of the created loan
     */
    function createLoan(
        uint256 collateralTokenId,
        uint256 principalUSDC,
        uint256 interestRate,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(assetTokenizer.ownerOf(collateralTokenId) == msg.sender, "Not collateral owner");
        require(principalUSDC > 0, "Invalid principal");

        uint256 loanId = _loanIdCounter++;
        uint256 totalOwed = principalUSDC + (principalUSDC * interestRate / 10000);

        // Transfer collateral to this contract
        assetTokenizer.transferFrom(msg.sender, address(this), collateralTokenId);

        // Deploy loan token (ERC-20 for trading)
        LoanToken loanToken = new LoanToken(
            string(abi.encodePacked("Loan #", _toString(loanId))),
            string(abi.encodePacked("LOAN", _toString(loanId))),
            loanId,
            totalOwed * 1e18  // 18 decimals
        );

        loans[loanId] = Loan({
            id: loanId,
            borrower: msg.sender,
            collateralTokenId: collateralTokenId,
            principalUSDC: principalUSDC,
            interestRate: interestRate,
            duration: duration,
            startTime: block.timestamp,
            totalOwed: totalOwed,
            loanToken: address(loanToken),
            status: LoanStatus.Active
        });

        borrowerLoans[msg.sender].push(loanId);

        // Transfer USDC to borrower
        USDC.transfer(msg.sender, principalUSDC);

        emit LoanCreated(loanId, msg.sender, principalUSDC);
        return loanId;
    }

    /**
     * @dev Repays a loan and returns collateral
     * @param loanId The ID of the loan to repay
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan not active");
        require(msg.sender == loan.borrower, "Not borrower");

        // Transfer USDC from borrower
        USDC.transferFrom(msg.sender, address(this), loan.totalOwed);

        // Return collateral
        assetTokenizer.transferFrom(address(this), msg.sender, loan.collateralTokenId);

        loan.status = LoanStatus.Repaid;
        emit LoanRepaid(loanId, loan.totalOwed);
    }

    /**
     * @dev Internal function to convert uint256 to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // --- View Functions for Frontend ---

    function getLoanCount() external view returns (uint256) {
        return _loanIdCounter;
    }

    function getUserLoans(address user) external view returns (uint256[] memory) {
        return borrowerLoans[user];
    }

    function getUserLoanDetails(address user) external view returns (Loan[] memory) {
        uint256[] memory ids = borrowerLoans[user];
        Loan[] memory userLoans = new Loan[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            userLoans[i] = loans[ids[i]];
        }
        return userLoans;
    }
}
