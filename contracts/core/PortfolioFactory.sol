// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PortfolioToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PortfolioFactory
 * @dev Factory for creating PortfolioToken instances
 */
contract PortfolioFactory is Ownable {
    address[] public allPortfolios;
    mapping(address => address[]) public userPortfolios;

    event PortfolioCreated(address indexed portfolio, address indexed creator, string name, string symbol);

    constructor() Ownable(msg.sender) {}

    function createPortfolio(
        string memory name,
        string memory symbol,
        PortfolioToken.TokenWeight[] memory composition,
        uint256 totalSupply
    ) external returns (address) {
        PortfolioToken newPortfolio = new PortfolioToken(name, symbol, composition, totalSupply);
        newPortfolio.transfer(msg.sender, totalSupply);
        
        allPortfolios.push(address(newPortfolio));
        userPortfolios[msg.sender].push(address(newPortfolio));
        
        emit PortfolioCreated(address(newPortfolio), msg.sender, name, symbol);
        return address(newPortfolio);
    }

    function getAllPortfolios() external view returns (address[] memory) {
        return allPortfolios;
    }

    function getUserPortfolios(address user) external view returns (address[] memory) {
        return userPortfolios[user];
    }
}
