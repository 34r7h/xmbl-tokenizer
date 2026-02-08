const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Testing Yellow Network Session for: ${deployer.address}`);

    const path = require("path");
    const fs = require("fs");
    const deploymentsPath = path.join(__dirname, "../frontend/src/contracts/deployments.json");
    
    if (!fs.existsSync(deploymentsPath)) {
        console.error("Deployments file not found.");
        return;
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
    const yellowBridgeAddress = deployments["YellowBridge"]?.address;
    const usdcAddress = deployments["USDC"]?.address;

    if (!yellowBridgeAddress || !usdcAddress) {
        console.error("YellowBridge or USDC address not found.");
        return;
    }

    // Contracts
    const YellowBridge = await hre.ethers.getContractFactory("YellowBridge");
    const yellowBridge = YellowBridge.attach(yellowBridgeAddress);

    const MockERC20 = await hre.ethers.getContractFactory("MockERC20"); // Assuming MockUSDC uses this
    const usdc = MockERC20.attach(usdcAddress);

    // 0. Mint USDC
    const amount = hre.ethers.parseUnits("1000", 6); // 1000 USDC
    console.log("Minting USDC...");
    const txMint = await usdc.mint(deployer.address, amount);
    await txMint.wait();

    // 1. Approve
    console.log("Approving YellowBridge...");
    const txApprove = await usdc.approve(yellowBridgeAddress, amount);
    await txApprove.wait();
    console.log("Approved.");

    // 2. Start Session
    console.log("Starting Session...");
    const txSession = await yellowBridge.startSession(usdcAddress, amount);
    const receipt = await txSession.wait();
    
    // Find event
    // The event signature is SessionStarted(bytes32 sessionId, address user, address token, uint256 amount)
    // In ethers v6, we might need to parse logs more carefully or just look at the contract state if easier.
    // For now, let's try to query the session from the contract if we can guess the ID, or just check user balance decreased.
    
    console.log("Session transaction confirmed.");

    // We can't easily get the return value from a transaction in ethers without parsing events.
    // Let's parse the event.
    const event = receipt.logs.find(log => {
        try {
            return yellowBridge.interface.parseLog(log).name === "SessionStarted";
        } catch (e) { return false; }
    });

    if (event) {
        const parsed = yellowBridge.interface.parseLog(event);
        const sessionId = parsed.args[0];
        console.log(`Yellow Session Started! ID: ${sessionId}`);
        
        // Verify state
        const session = await yellowBridge.sessions(sessionId);
        console.log("On-Chain Session Data:");
        console.log(`  User: ${session.user}`);
        console.log(`  Amount: ${session.depositedAmount.toString()}`);
        console.log(`  Active: ${session.isActive}`);
    } else {
        console.log("SessionStarted event not found in logs.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
