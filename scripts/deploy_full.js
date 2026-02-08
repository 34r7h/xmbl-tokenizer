const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Mock USDC
  console.log("Deploying MockERC20 (USDC)...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  // 2. Deploy AssetTokenizer
  console.log("Deploying AssetTokenizer...");
  const AssetTokenizer = await hre.ethers.getContractFactory("AssetTokenizer");
  const assetTokenizer = await AssetTokenizer.deploy();
  await assetTokenizer.waitForDeployment();
  const assetTokenizerAddress = await assetTokenizer.getAddress();
  console.log("AssetTokenizer deployed to:", assetTokenizerAddress);

  // 3. Deploy LoanFactory
  console.log("Deploying LoanFactory...");
  const LoanFactory = await hre.ethers.getContractFactory("LoanFactory");
  const loanFactory = await LoanFactory.deploy(usdcAddress, assetTokenizerAddress);
  await loanFactory.waitForDeployment();
  const loanFactoryAddress = await loanFactory.getAddress();
  console.log("LoanFactory deployed to:", loanFactoryAddress);

  // 4. Deploy PortfolioFactory
  console.log("Deploying PortfolioFactory...");
  const PortfolioFactory = await hre.ethers.getContractFactory("PortfolioFactory");
  const portfolioFactory = await PortfolioFactory.deploy();
  await portfolioFactory.waitForDeployment();
  const portfolioFactoryAddress = await portfolioFactory.getAddress();
  console.log("PortfolioFactory deployed to:", portfolioFactoryAddress);

  // 5. Deploy InsurancePool
  console.log("Deploying InsurancePool...");
  const InsurancePool = await hre.ethers.getContractFactory("InsurancePool");
  const insurancePool = await InsurancePool.deploy(usdcAddress);
  await insurancePool.waitForDeployment();
  const insurancePoolAddress = await insurancePool.getAddress();
  console.log("InsurancePool deployed to:", insurancePoolAddress);

  // 6. Deploy LiquidityPool
  console.log("Deploying LiquidityPool...");
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(usdcAddress);
  await liquidityPool.waitForDeployment();
  const liquidityPoolAddress = await liquidityPool.getAddress();
  console.log("LiquidityPool deployed to:", liquidityPoolAddress);

  // 7. Deploy OrderBook
  console.log("Deploying OrderBook...");
  const OrderBook = await hre.ethers.getContractFactory("OrderBook");
  const orderBook = await OrderBook.deploy();
  await orderBook.waitForDeployment();
  const orderBookAddress = await orderBook.getAddress();
  console.log("OrderBook deployed to:", orderBookAddress);

  // 8. Deploy YellowBridge
  console.log("Deploying YellowBridge...");
  const YellowBridge = await hre.ethers.getContractFactory("YellowBridge");
  const yellowBridge = await YellowBridge.deploy();
  await yellowBridge.waitForDeployment();
  const yellowBridgeAddress = await yellowBridge.getAddress();
  console.log("YellowBridge deployed to:", yellowBridgeAddress);

  // 9. Deploy AgentExecutor
  console.log("Deploying AgentExecutor...");
  const AgentExecutor = await hre.ethers.getContractFactory("AgentExecutor");
  const agentExecutor = await AgentExecutor.deploy();
  await agentExecutor.waitForDeployment();
  const agentExecutorAddress = await agentExecutor.getAddress();
  console.log("AgentExecutor deployed to:", agentExecutorAddress);

  console.log("\nDeployment complete! Summary of addresses:");
  const summary = {
    USDC: usdcAddress,
    AssetTokenizer: assetTokenizerAddress,
    LoanFactory: loanFactoryAddress,
    PortfolioFactory: portfolioFactoryAddress,
    InsurancePool: insurancePoolAddress,
    LiquidityPool: liquidityPoolAddress,
    OrderBook: orderBookAddress,
    YellowBridge: yellowBridgeAddress,
    AgentExecutor: agentExecutorAddress
  };
  console.table(summary);

  // Save to frontend for development integration
  const fs = require('fs');
  const path = require('path');
  const addressesPath = path.join(__dirname, '../frontend/src/contracts/addresses.json');
  
  if (!fs.existsSync(path.dirname(addressesPath))) {
    fs.mkdirSync(path.dirname(addressesPath), { recursive: true });
  }

  fs.writeFileSync(addressesPath, JSON.stringify(summary, null, 2));
  console.log("\nAddresses saved to frontend/src/contracts/addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
