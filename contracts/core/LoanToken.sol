// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title LoanToken
 * @dev ERC-20 representing fractional loan positions
 * @notice Each loan created by LoanFactory deploys a new LoanToken instance
 */
contract LoanToken is ERC20 {
    address public loanContract;
    uint256 public loanId;

    /**
     * @dev Creates a new loan token
     * @param name Token name (e.g., "Loan #42")
     * @param symbol Token symbol (e.g., "LOAN42")
     * @param _loanId The ID of the loan this token represents
     * @param totalSupply The total supply to mint to the deployer
     */
    constructor(
        string memory name,
        string memory symbol,
        uint256 _loanId,
        uint256 totalSupply
    ) ERC20(name, symbol) {
        loanContract = msg.sender;
        loanId = _loanId;
        _mint(msg.sender, totalSupply);
    }

    /**
     * @dev Returns information about the loan this token represents
     * @return The loan contract address and loan ID
     */
    function getLoanInfo() external view returns (address, uint256) {
        return (loanContract, loanId);
    }
}
