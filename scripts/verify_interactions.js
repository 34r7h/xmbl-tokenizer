const hre = require("hardhat");
const deployments = require("../frontend/src/contracts/deployments.json");

async function main() {
  console.log("🔍 Verifying interactions with deployed contracts...");
  console.log("---------------------------------------------------");

  const [signer] = await hre.ethers.getSigners();
  console.log("👤 Acting as:", signer.address);

  // 1. Get Contract Instances
  const AssetTokenizer = await hre.ethers.getContractAt("AssetTokenizer", deployments.AssetTokenizer.address);
  const LoanFactory = await hre.ethers.getContractAt("LoanFactory", deployments.LoanFactory.address);
  // LoanToken ABI is needed, but we don't have deployment address yet (created dynamically)
  // We'll get it from event logs.

  // 2. Mint an Asset
  console.log("\n[1] Minting Real World Asset...");
  const txMint = await AssetTokenizer.tokenizeAsset(
    "Classic Car",
    150000, // $150k
    "QmHash123456789",
    signer.address
  );
  const receiptMint = await txMint.wait();
  
  // Find Token ID from event
  // Event: AssetTokenized(uint256 indexed tokenId, address indexed owner, string assetType, uint256 valuation)
  // In ethers v6, we can parse logs
  const mintEvent = receiptMint.logs.find(log => {
      try { return AssetTokenizer.interface.parseLog(log)?.name === "AssetTokenized" } catch (e) { return false }
  });
  const tokenId = AssetTokenizer.interface.parseLog(mintEvent).args.tokenId;
  console.log(`✅ Asset Minted! Token ID: ${tokenId} (Valuation: $150,000)`);

  // 3. Approve LoanFactory to use Asset
  console.log("\n[2] Approving LoanFactory...");
  await AssetTokenizer.approve(deployments.LoanFactory.address, tokenId);
  console.log("✅ Approved.");

  // [2b] Fund LoanFactory with USDC
  console.log("\n[2b] Funding LoanFactory with Liquidity...");
  const MockERC20 = await hre.ethers.getContractAt("MockERC20", deployments.USDC.address);
  const fundAmount = hre.ethers.parseUnits("1000000", 6); // $1M
  await MockERC20.mint(deployments.LoanFactory.address, fundAmount);
  console.log(`✅ Funded LoanFactory with $1,000,000 USDC`);

  // 4. Create Loan
  console.log("\n[3] Creating Loan...");
  const principal = hre.ethers.parseUnits("50000", 6); // $50k USDC
  const interest = 500; // 5%
  const duration = 30 * 24 * 60 * 60; // 30 days
  
  const txLoan = await LoanFactory.createLoan(
    tokenId,
    principal,
    interest,
    duration
  );
  const receiptLoan = await txLoan.wait();
  
  const loanEvent = receiptLoan.logs.find(log => {
      try { return LoanFactory.interface.parseLog(log)?.name === "LoanCreated" } catch (e) { return false }
  });
  const loanId = LoanFactory.interface.parseLog(loanEvent).args.loanId;
  console.log(`✅ Loan Created! Loan ID: ${loanId}`);

  // 5. Check Loan Token
  const loanData = await LoanFactory.loans(loanId);
  console.log(`ℹ️  Loan Token Address: ${loanData.loanToken}`);
  console.log(`ℹ️  Principal: ${hre.ethers.formatUnits(loanData.principalUSDC, 6)} USDC`);

  console.log("\nReviewing Agent Registry...");
  const AgentExecutor = await hre.ethers.getContractAt("AgentExecutor", deployments.AgentExecutor.address);
  try {
      const txReg = await AgentExecutor.registerStrategy("arbitrage", "0x1234");
      await txReg.wait();
      console.log("✅ Agent Strategy Registered.");
  } catch (e) {
      console.log("⚠️  Agent Strategy Registration failed (might be duplicate if re-running without restart).");
  }

  console.log("\n---------------------------------------------------");
  console.log("🎉 Verification Complete! Contracts are alive and responding.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
