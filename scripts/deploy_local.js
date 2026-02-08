const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to localhost...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📦 Deploying contracts with account:", deployer.address);

  // 1. Deploy AssetTokenizer
  const AssetTokenizer = await hre.ethers.getContractFactory("AssetTokenizer");
  const assetTokenizer = await AssetTokenizer.deploy();
  await assetTokenizer.waitForDeployment();
  const assetTokenizerParams = { address: await assetTokenizer.getAddress(), abi: AssetTokenizer.interface.formatJson() };
  console.log("✅ AssetTokenizer deployed to:", assetTokenizerParams.address);

  // 2. Deploy MockUSDC
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcParams = { address: await usdc.getAddress(), abi: MockERC20.interface.formatJson() };
  console.log("✅ MockUSDC deployed to:", usdcParams.address);

  // 3. Deploy LoanFactory
  const LoanFactory = await hre.ethers.getContractFactory("LoanFactory");
  const loanFactory = await LoanFactory.deploy(usdcParams.address, assetTokenizerParams.address);
  await loanFactory.waitForDeployment();
  const loanFactoryParams = { address: await loanFactory.getAddress(), abi: LoanFactory.interface.formatJson() };
  console.log("✅ LoanFactory deployed to:", loanFactoryParams.address);

  // 4. Deploy YellowBridge
  const YellowBridge = await hre.ethers.getContractFactory("YellowBridge");
  const yellowBridge = await YellowBridge.deploy();
  await yellowBridge.waitForDeployment();
  const yellowBridgeParams = { address: await yellowBridge.getAddress(), abi: YellowBridge.interface.formatJson() };
  console.log("✅ YellowBridge deployed to:", yellowBridgeParams.address);

  // 5. Deploy PortfolioFactory
  const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
  const portfolioFactory = await PortfolioFactory.deploy();
  await portfolioFactory.waitForDeployment();
  const portfolioFactoryParams = { address: await portfolioFactory.getAddress(), abi: PortfolioFactory.interface.formatJson() };
  console.log("✅ PortfolioFactory deployed to:", portfolioFactoryParams.address);

  // 6. Deploy AgentExecutor
  const AgentExecutor = await hre.ethers.getContractFactory("AgentExecutor");
  const agentExecutor = await AgentExecutor.deploy();
  await agentExecutor.waitForDeployment();
  const agentExecutorParams = { address: await agentExecutor.getAddress(), abi: AgentExecutor.interface.formatJson() };
  console.log("✅ AgentExecutor deployed to:", agentExecutorParams.address);

  // Prepare output
  const deployments = {
    AssetTokenizer: assetTokenizerParams,
    USDC: usdcParams,
    LoanFactory: loanFactoryParams,
    YellowBridge: yellowBridgeParams,
    PortfolioFactory: portfolioFactoryParams,
    AgentExecutor: agentExecutorParams,
    network: hre.network.name,
    chainId: hre.network.config.chainId
  };

  // Write to frontend
  const frontendDir = path.join(__dirname, "../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }
  
  const outputPath = path.join(frontendDir, "deployments.json");
  fs.writeFileSync(outputPath, JSON.stringify(deployments, null, 2));
  console.log(`\n💾 Deployments saved to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
