const hre = require("hardhat");

async function main() {
    const [deployer, agent] = await hre.ethers.getSigners();
    console.log("Deploying Agent System with account:", deployer.address);

    // 1. Deploy Registry
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy();
    await registry.waitForDeployment();
    console.log("AgentRegistry deployed to:", await registry.getAddress());
    
    // 2. Register an Agent
    console.log("Registering Agent:", agent.address);
    await registry.registerAgent(agent.address, "AlphaZero", "yield_farming");
    
    // 3. Deploy Mock Asset (USDC)
    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    console.log("Mock USDC deployed to:", await usdc.getAddress());
    
    // 4. Deploy StrategyVault
    const StrategyVault = await hre.ethers.getContractFactory("StrategyVault");
    const vault = await StrategyVault.deploy(await registry.getAddress(), await usdc.getAddress());
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log("StrategyVault deployed to:", vaultAddress);
    
    // 5. User Deposits
    const depositAmount = hre.ethers.parseUnits("1000", 6);
    await usdc.mint(deployer.address, depositAmount);
    await usdc.approve(vaultAddress, depositAmount);
    await vault.deposit(depositAmount);
    console.log("Deposited 1000 USDC into Vault");
    
    // 6. Agent Executes Strategy
    console.log("Agent executing strategy...");
    await vault.connect(agent).executeStrategy(hre.ethers.parseUnits("500", 6), "Rebalance Portfolio");
    
    console.log("✅ Agent System Verified!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
