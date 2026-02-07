// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YellowBridge
 * @dev Settlement contract for Yellow Network off-chain trading
 */
contract YellowBridge is ReentrancyGuard {
    struct Session {
        address user;
        uint256 depositedAmount;
        address token;
        uint256 startTime;
        bool isActive;
    }
    
    mapping(bytes32 => Session) public sessions;
    
    event SessionStarted(bytes32 indexed sessionId, address indexed user, address token, uint256 amount);
    event SessionSettled(bytes32 indexed sessionId, uint256 finalBalance);
    
    /**
     * @dev Start a trading session by locking tokens in the bridge.
     * @param token The address of the ERC20 token to lock.
     * @param amount The amount of tokens to lock.
     * @return sessionId The unique identifier for the session.
     */
    function startSession(address token, uint256 amount) external nonReentrant returns (bytes32) {
        require(amount > 0, "Invalid amount");
        
        // Generate sessionId: keccak256(msg.sender, token, block.timestamp)
        bytes32 sessionId = keccak256(abi.encodePacked(msg.sender, token, block.timestamp));
        require(!sessions[sessionId].isActive, "Session ID collision");
        
        // Lock tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        sessions[sessionId] = Session({
            user: msg.sender,
            depositedAmount: amount,
            token: token,
            startTime: block.timestamp,
            isActive: true
        });
        
        emit SessionStarted(sessionId, msg.sender, token, amount);
        return sessionId;
    }
    
    /**
     * @dev Settle a trading session and return the final balance to the user.
     * @param sessionId The unique identifier for the session.
     * @param finalBalance The final balance to return to the user.
     */
    function settleSession(bytes32 sessionId, uint256 finalBalance) external nonReentrant {
        Session storage session = sessions[sessionId];
        require(session.isActive, "Session not active");
        require(msg.sender == session.user, "Not session owner");
        require(finalBalance <= session.depositedAmount, "Invalid final balance");
        
        session.isActive = false;
        
        // Return final balance to user
        IERC20(session.token).transfer(session.user, finalBalance);
        
        emit SessionSettled(sessionId, finalBalance);
    }
}
