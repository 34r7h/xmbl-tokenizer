const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Minting asset for: ${deployer.address}`);

    const path = require("path");
    const fs = require("fs");
    const deploymentsPath = path.join(__dirname, "../frontend/src/contracts/deployments.json");
    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    const assetTokenizerAddress = deployments["AssetTokenizer"]?.address;

    const AssetTokenizer = await hre.ethers.getContractFactory("AssetTokenizer");
    const assetTokenizer = AssetTokenizer.attach(assetTokenizerAddress);

    const tx = await assetTokenizer.tokenizeAsset(
        "real_estate",
        500000, // $500k
        "IPFS_HASH_DEBUG_123",
        deployer.address
    );
    await tx.wait();

    console.log("Minted Asset: Real Estate ($500k)");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
