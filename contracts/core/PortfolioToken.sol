// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PortfolioToken
 * @dev Meta-token wrapping multiple ERC-20s (including other portfolios)
 * @notice Enables recursive portfolio composition for diversified exposure
 */
contract PortfolioToken is ERC20 {
    struct TokenWeight {
        address token;
        uint256 weight;  // Basis points (10000 = 100%)
    }

    TokenWeight[] public composition;
    mapping(address => uint256) public tokenIndex;

    event PortfolioCreated(address indexed creator, uint256 totalSupply);

    /**
     * @dev Creates a new portfolio token
     * @param name Token name
     * @param symbol Token symbol
     * @param _composition Array of tokens and their weights (must sum to 10000)
     * @param totalSupply Total supply to mint to creator
     */
    constructor(
        string memory name,
        string memory symbol,
        TokenWeight[] memory _composition,
        uint256 totalSupply
    ) ERC20(name, symbol) {
        require(_composition.length > 0, "Empty portfolio");

        uint256 totalWeight = 0;
        for (uint256 i = 0; i < _composition.length; i++) {
            composition.push(_composition[i]);
            tokenIndex[_composition[i].token] = i;
            totalWeight += _composition[i].weight;
        }
        require(totalWeight == 10000, "Weights must sum to 100%");

        _mint(msg.sender, totalSupply);
        emit PortfolioCreated(msg.sender, totalSupply);
    }

    /**
     * @dev Returns the full composition of the portfolio
     * @return Array of TokenWeight structs
     */
    function getComposition() external view returns (TokenWeight[] memory) {
        return composition;
    }
}
