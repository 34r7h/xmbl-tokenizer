// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry
 * @dev Registry for AI agents authorized to manage portfolios
 */
contract AgentRegistry is Ownable {
    struct Agent {
        string name;
        string strategyType; // "conservative", "aggressive", "yield_farming"
        uint256 performanceScore;
        bool isActive;
        uint256 registeredAt;
    }
    
    mapping(address => Agent) public agents;
    address[] public agentList;
    
    event AgentRegistered(address indexed agentAddress, string name, string strategyType);
    event AgentStatusUpdated(address indexed agentAddress, bool isActive);
    event AgentPerformanceUpdated(address indexed agentAddress, uint256 newScore);
    
    constructor() Ownable(msg.sender) {}
    
    function registerAgent(
        address agentAddress,
        string memory name,
        string memory strategyType
    ) external onlyOwner {
        require(bytes(agents[agentAddress].name).length == 0, "Agent already registered");
        
        agents[agentAddress] = Agent({
            name: name,
            strategyType: strategyType,
            performanceScore: 1000, // Initial score
            isActive: true,
            registeredAt: block.timestamp
        });
        
        agentList.push(agentAddress);
        emit AgentRegistered(agentAddress, name, strategyType);
    }
    
    function updateAgentStatus(address agentAddress, bool isActive) external onlyOwner {
        require(bytes(agents[agentAddress].name).length > 0, "Agent not found");
        agents[agentAddress].isActive = isActive;
        emit AgentStatusUpdated(agentAddress, isActive);
    }
    
    function updatePerformance(address agentAddress, uint256 newScore) external onlyOwner {
        require(bytes(agents[agentAddress].name).length > 0, "Agent not found");
        agents[agentAddress].performanceScore = newScore;
        emit AgentPerformanceUpdated(agentAddress, newScore);
    }
    
    function getAgent(address agentAddress) external view returns (Agent memory) {
        return agents[agentAddress];
    }
    
    function getAllAgents() external view returns (address[] memory) {
        return agentList;
    }
}
