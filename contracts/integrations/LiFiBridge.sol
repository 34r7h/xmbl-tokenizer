// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiFiBridge
 * @dev Mock contract for LI.FI cross-chain bridging
 */
contract LiFiBridge is ReentrancyGuard {
    event CrossChainTransfer(
        bytes32 indexed transactionId,
        address indexed sender,
        address token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient
    );

    function bridgeToken(
        address token,
        uint256 amount,
        uint256 destinationChainId,
        address recipient
    ) external nonReentrant returns (bytes32) {
        require(amount > 0, "Invalid amount");
        
        // Transfer tokens to bridge
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        bytes32 transactionId = keccak256(
            abi.encodePacked(msg.sender, token, amount, destinationChainId, block.timestamp)
        );
        
        emit CrossChainTransfer(
            transactionId,
            msg.sender,
            token,
            amount,
            destinationChainId,
            recipient
        );
        
        return transactionId;
    }
}
