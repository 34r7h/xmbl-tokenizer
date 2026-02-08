// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title LiquidityPool
 * @dev Simple LP for providing liquidity to LoanTokens
 */
contract LiquidityPool is ReentrancyGuard {
    struct Pool {
        address token;
        uint256 totalLiquidity;
        uint256 reserveUSDC;
    }

    IERC20 public immutable USDC;
    mapping(address => Pool) public pools;

    event LiquidityAdded(address indexed token, uint256 usdcAmount, uint256 tokenAmount);
    event LiquidityRemoved(address indexed token, uint256 usdcAmount, uint256 tokenAmount);

    constructor(address _usdc) {
        USDC = IERC20(_usdc);
    }

    function addLiquidity(address token, uint256 usdcAmount, uint256 tokenAmount) external nonReentrant {
        USDC.transferFrom(msg.sender, address(this), usdcAmount);
        IERC20(token).transferFrom(msg.sender, address(this), tokenAmount);

        Pool storage pool = pools[token];
        pool.token = token;
        pool.totalLiquidity += tokenAmount;
        pool.reserveUSDC += usdcAmount;

        emit LiquidityAdded(token, usdcAmount, tokenAmount);
    }

    function removeLiquidity(address token, uint256 tokenAmount) external nonReentrant {
        Pool storage pool = pools[token];
        require(pool.totalLiquidity >= tokenAmount, "Insufficient liquidity");

        uint256 usdcShare = (pool.reserveUSDC * tokenAmount) / pool.totalLiquidity;
        
        pool.totalLiquidity -= tokenAmount;
        pool.reserveUSDC -= usdcShare;

        IERC20(token).transfer(msg.sender, tokenAmount);
        USDC.transfer(msg.sender, usdcShare);

        emit LiquidityRemoved(token, usdcShare, tokenAmount);
    }
}
