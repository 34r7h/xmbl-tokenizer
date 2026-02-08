const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Checking assets for account: ${deployer.address}`);

    const path = require("path");
    const fs = require("fs");
    const deploymentsPath = path.join(__dirname, "../frontend/src/contracts/deployments.json");
    
    if (!fs.existsSync(deploymentsPath)) {
        console.error(`Deployments file not found at: ${deploymentsPath}`);
        return;
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    const assetTokenizerAddress = deployments["AssetTokenizer"]?.address;

    if (!assetTokenizerAddress) {
        console.error("AssetTokenizer address not found in deployments.json");
        return;
    }

    const AssetTokenizer = await hre.ethers.getContractFactory("AssetTokenizer");
    const assetTokenizer = AssetTokenizer.attach(assetTokenizerAddress);

    console.log(`Contract Address: ${assetTokenizerAddress}`);

    try {
        const result = await assetTokenizer.getUserAssetDetails(deployer.address);
        const assets = result[0]; // Asset structs
        const tokenIds = result[1]; // Token IDs

        console.log(`\nFound ${tokenIds.length} assets:`);
        
        for (let i = 0; i < tokenIds.length; i++) {
            const asset = assets[i];
            console.log(`\n[Token ID #${tokenIds[i]}]`);
            console.log(`  Type: ${asset.assetType}`);
            console.log(`  Valuation: $${asset.valuationUSD.toString()}`);
            console.log(`  Document Hash: ${asset.documentHash}`);
            console.log(`  Active: ${asset.isActive}`);
        }

        if (tokenIds.length === 0) {
            console.log("No assets found. You may need to run the seed script or mint an asset.");
        }

    } catch (error) {
        console.error("\nError fetching assets:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
