// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentExecutor
 * @dev On-chain registry and execution hub for AI-defined DeFi strategies
 */
contract AgentExecutor is Ownable, ReentrancyGuard {
    struct Strategy {
        bytes32 id;
        address owner;
        string strategyType;
        bool isActive;
        uint256 lastExecuted;
    }
    
    mapping(bytes32 => Strategy) public strategies;
    mapping(address => bytes32[]) public userStrategies;
    
    event StrategyRegistered(bytes32 indexed strategyId, address indexed owner, string strategyType);
    event StrategyExecuted(bytes32 indexed strategyId, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Register a new AI strategy.
     * @param strategyType The type of strategy (e.g., "rebalancing", "lending").
     * @param strategyData Opaque bytes containing strategy parameters/logic (stored off-chain or emitted).
     * @return strategyId The unique ID of the registered strategy.
     */
    function registerStrategy(
        string memory strategyType,
        bytes memory strategyData
    ) external returns (bytes32) {
        bytes32 strategyId = keccak256(abi.encodePacked(
            msg.sender,
            strategyType,
            block.timestamp
        ));
        
        require(strategies[strategyId].id == bytes32(0), "Strategy ID collision");

        strategies[strategyId] = Strategy({
            id: strategyId,
            owner: msg.sender,
            strategyType: strategyType,
            isActive: true,
            lastExecuted: 0
        });
        
        userStrategies[msg.sender].push(strategyId);
        emit StrategyRegistered(strategyId, msg.sender, strategyType);
        
        return strategyId;
    }
    
    /**
     * @dev Execute a registered strategy.
     * @param strategyId The ID of the strategy to execute.
     * @param actionData Data relevant to the specific execution (e.g., swap parameters).
     */
    function executeStrategy(bytes32 strategyId, bytes calldata actionData) external {
        Strategy storage strategy = strategies[strategyId];
        require(strategy.isActive, "Strategy not active");
        // In a production environment, you would check if msg.sender is authorized (owner or authorized keeper)
        // require(msg.sender == strategy.owner || isAuthorizedKeeper[msg.sender], "Unauthorized");
        
        // Logic to decode actionData and perform on-chain actions would go here.
        // For the scope of this hackathon/MVP, we update the timestamp to reflect execution.
        
        strategy.lastExecuted = block.timestamp;
        emit StrategyExecuted(strategyId, block.timestamp);
    }

    /**
     * @dev Toggle the active status of a strategy.
     * @param strategyId The ID of the strategy.
     * @param active The new status.
     */
    function setStrategyStatus(bytes32 strategyId, bool active) external {
        Strategy storage strategy = strategies[strategyId];
        require(msg.sender == strategy.owner, "Not owner");
        strategy.isActive = active;
    }
}
