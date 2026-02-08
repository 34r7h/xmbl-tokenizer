// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AssetTokenizer
 * @dev Base NFT for real-world assets with metadata
 * @notice Tokenizes RWAs (real estate, invoices, equipment) as ERC-721 tokens
 */
contract AssetTokenizer is ERC721, Ownable {
    struct Asset {
        string assetType;      // "real_estate", "invoice", "equipment"
        uint256 valuationUSD;  // Appraised value
        string documentHash;   // IPFS hash of documentation
        address appraiser;     // Who valued this
        uint256 createdAt;
        bool isActive;
    }

    uint256 private _tokenIdCounter;
    mapping(uint256 => Asset) public assets;

    event AssetTokenized(
        uint256 indexed tokenId,
        address indexed owner,
        string assetType,
        uint256 valuation
    );

    constructor() ERC721("RWA Token", "RWA") Ownable(msg.sender) {}

    /**
     * @dev Tokenizes a real-world asset as an NFT
     * @param assetType Type of asset (e.g., "real_estate", "invoice", "equipment")
     * @param valuationUSD Appraised value in USD
     * @param documentHash IPFS hash of asset documentation
     * @param appraiser Address of the appraiser who valued this asset
     * @return tokenId The ID of the newly minted token
     */
    function tokenizeAsset(
        string memory assetType,
        uint256 valuationUSD,
        string memory documentHash,
        address appraiser
    ) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;

        assets[tokenId] = Asset({
            assetType: assetType,
            valuationUSD: valuationUSD,
            documentHash: documentHash,
            appraiser: appraiser,
            createdAt: block.timestamp,
            isActive: true
        });

        _safeMint(msg.sender, tokenId);
        emit AssetTokenized(tokenId, msg.sender, assetType, valuationUSD);

        return tokenId;
    }

    /**
     * @dev Retrieves asset metadata for a token
     * @param tokenId The token ID to query
     * @return Asset struct containing all metadata
     */
    function getAsset(uint256 tokenId) external view returns (Asset memory) {
        require(_ownerOf(tokenId) != address(0), "Asset does not exist");
        return assets[tokenId];
    }

    // --- View Functions for Frontend ---

    function getAssetCount() external view returns (uint256) {
        return _tokenIdCounter;
    }

    function getUserAssets(address user) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(user);
        uint256[] memory tokens = new uint256[](balance);
        uint256 counter = 0;
        for (uint256 i = 0; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == user) {
                tokens[counter] = i;
                counter++;
                if (counter == balance) break;
            }
        }
        return tokens;
    }

    /**
     * @dev Efficiently fetches all asset details for a user in one call
     * @param user The address of the user
     * @return assetsData An array of Asset structs owned by the user
     * @return tokenIds The corresponding token IDs
     */
    function getUserAssetDetails(address user) external view returns (Asset[] memory assetsData, uint256[] memory tokenIds) {
        tokenIds = this.getUserAssets(user);
        assetsData = new Asset[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            assetsData[i] = assets[tokenIds[i]];
        }
        return (assetsData, tokenIds);
    }
}
