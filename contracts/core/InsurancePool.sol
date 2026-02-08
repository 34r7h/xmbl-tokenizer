// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InsuranceToken.sol";

/**
 * @title InsurancePool
 * @dev Manages Credit Default Swaps (CDS) for loan positions
 */
contract InsurancePool is ReentrancyGuard, Ownable {
    struct Policy {
        uint256 loanId;
        uint256 coverageAmount;
        uint256 premium;
        uint256 expiry;
        address insurer;
        bool isClaimed;
    }

    IERC20 public immutable USDC;
    mapping(uint256 => Policy) public policies;
    uint256 private _policyIdCounter;

    event PolicyCreated(uint256 indexed policyId, uint256 loanId, address indexed insurer, uint256 coverage);
    event ClaimPaid(uint256 indexed policyId, uint256 amount);

    constructor(address _usdc) Ownable(msg.sender) {
        USDC = IERC20(_usdc);
    }

    function createPolicy(
        uint256 loanId,
        uint256 coverageAmount,
        uint256 premium,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(coverageAmount > 0, "Invalid coverage");
        
        // Transfer premium from coverage seekers (mock logic for demo simplification)
        USDC.transferFrom(msg.sender, address(this), premium);

        uint256 policyId = _policyIdCounter++;
        policies[policyId] = Policy({
            loanId: loanId,
            coverageAmount: coverageAmount,
            premium: premium,
            expiry: block.timestamp + duration,
            insurer: msg.sender,
            isClaimed: false
        });

        emit PolicyCreated(policyId, loanId, msg.sender, coverageAmount);
        return policyId;
    }

    function claimInsurance(uint256 policyId) external nonReentrant {
        Policy storage policy = policies[policyId];
        require(!policy.isClaimed, "Already claimed");
        require(block.timestamp <= policy.expiry, "Expired");
        
        policy.isClaimed = true;
        USDC.transfer(policy.insurer, policy.coverageAmount);
        
        emit ClaimPaid(policyId, policy.coverageAmount);
    }
}
