const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying LiFiBridge with account:", deployer.address);

    const LiFiBridge = await hre.ethers.getContractFactory("LiFiBridge");
    const liFiBridge = await LiFiBridge.deploy();
    await liFiBridge.waitForDeployment();
    
    console.log("LiFiBridge deployed to:", await liFiBridge.getAddress());

    // Mock interaction
    console.log("\nSimulating Cross-Chain Transfer...");
    
    // Deploy Mock Token
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const token = await MockERC20.deploy("Test Token", "TEST", 18);
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    // Mint and Approve
    await token.mint(deployer.address, hre.ethers.parseEther("1000"));
    await token.approve(await liFiBridge.getAddress(), hre.ethers.parseEther("100"));
    
    // Bridge
    const tx = await liFiBridge.bridgeToken(
        tokenAddress,
        hre.ethers.parseEther("100"),
        137, // Polygon
        deployer.address
    );
    
    const receipt = await tx.wait();
    console.log("LI.FI: Bridging to Polygon (ChainId: 137)...");
    console.log("CrossChainTransfer Event Emitted:", receipt.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
