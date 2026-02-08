// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./AgentRegistry.sol";

/**
 * @title StrategyVault
 * @dev Vault where users deposit funds for agents to manage
 */
contract StrategyVault is Ownable {
    using SafeERC20 for IERC20;

    AgentRegistry public immutable registry;
    IERC20 public immutable asset;
    
    struct UserDeposit {
        uint256 amount;
        uint256 timestamp;
    }
    
    mapping(address => UserDeposit) public deposits;
    uint256 public totalDeposits;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event StrategyExecuted(address indexed agent, uint256 amount, string action);
    
    constructor(address _registry, address _asset) Ownable(msg.sender) {
        registry = AgentRegistry(_registry);
        asset = IERC20(_asset);
    }
    
    function deposit(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        
        asset.safeTransferFrom(msg.sender, address(this), amount);
        
        deposits[msg.sender].amount += amount;
        deposits[msg.sender].timestamp = block.timestamp;
        totalDeposits += amount;
        
        emit Deposit(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external {
        require(deposits[msg.sender].amount >= amount, "Insufficient balance");
        
        deposits[msg.sender].amount -= amount;
        totalDeposits -= amount;
        
        asset.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
    
    // Only registered active agents can execute strategies
    function executeStrategy(uint256 amount, string memory action) external {
        AgentRegistry.Agent memory agent = registry.getAgent(msg.sender);
        require(agent.isActive, "Unauthorized agent");
        require(amount <= totalDeposits, "Insufficient vault funds");
        
        // In a real implementation, this would interact with DeFi protocols (Aave, Uniswap, etc.)
        // For this hackathon version, we emit the event for tracking.
        emit StrategyExecuted(msg.sender, amount, action);
    }
}
