// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title OrderBook
 * @dev On-chain fallback orderbook for trading LoanTokens
 */
contract OrderBook is ReentrancyGuard {
    struct Order {
        address maker;
        address tokenSell;
        address tokenBuy;
        uint256 amountSell;
        uint256 amountBuy;
        bool isActive;
    }

    mapping(uint256 => Order) public orders;
    uint256 private _orderIdCounter;

    event OrderCreated(uint256 indexed orderId, address indexed maker, address tokenSell, address tokenBuy, uint256 amountSell, uint256 amountBuy);
    event OrderFulfilled(uint256 indexed orderId, address indexed taker);
    event OrderCancelled(uint256 indexed orderId);

    function createOrder(
        address tokenSell,
        address tokenBuy,
        uint256 amountSell,
        uint256 amountBuy
    ) external nonReentrant returns (uint256) {
        require(amountSell > 0 && amountBuy > 0, "Invalid amounts");
        
        IERC20(tokenSell).transferFrom(msg.sender, address(this), amountSell);

        uint256 orderId = _orderIdCounter++;
        orders[orderId] = Order({
            maker: msg.sender,
            tokenSell: tokenSell,
            tokenBuy: tokenBuy,
            amountSell: amountSell,
            amountBuy: amountBuy,
            isActive: true
        });

        emit OrderCreated(orderId, msg.sender, tokenSell, tokenBuy, amountSell, amountBuy);
        return orderId;
    }

    function fulfillOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");

        order.isActive = false;
        
        // Taker pays to Maker
        IERC20(order.tokenBuy).transferFrom(msg.sender, order.maker, order.amountBuy);
        
        // Exchange pays to Taker
        IERC20(order.tokenSell).transfer(msg.sender, order.amountSell);

        emit OrderFulfilled(orderId, msg.sender);
    }

    function cancelOrder(uint256 orderId) external nonReentrant {
        Order storage order = orders[orderId];
        require(order.isActive, "Order not active");
        require(order.maker == msg.sender, "Not maker");

        order.isActive = false;
        IERC20(order.tokenSell).transfer(msg.sender, order.amountSell);

        emit OrderCancelled(orderId);
    }
}
