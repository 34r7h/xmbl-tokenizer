const hre = require("hardhat");
const addresses = require("../frontend/src/contracts/addresses.json");

async function main() {
  const [owner, borrower, investor] = await hre.ethers.getSigners();
  console.log("Verifying E2E Logic on Hardhat Node...");

  // Get Contract Instances
  const usdc = await hre.ethers.getContractAt("MockERC20", addresses.USDC);
  const assetTokenizer = await hre.ethers.getContractAt("AssetTokenizer", addresses.AssetTokenizer);
  const loanFactory = await hre.ethers.getContractAt("LoanFactory", addresses.LoanFactory);
  const portfolioFactory = await hre.ethers.getContractAt("PortfolioFactory", addresses.PortfolioFactory);

  // 1. Initial State: Mint USDC to Borrower, Investor, and LoanFactory
  console.log("\n--- Step 1: Initialization ---");
  await usdc.mint(borrower.address, hre.ethers.parseUnits("10000", 6));
  await usdc.mint(investor.address, hre.ethers.parseUnits("10000", 6));
  await usdc.mint(addresses.LoanFactory, hre.ethers.parseUnits("100000", 6)); // Fund the factory for payouts
  console.log("Minted USDC to Borrower, Investor, and LoanFactory.");

  // 2. Tokenize RWA
  console.log("\n--- Step 2: RWA Tokenization ---");
  const tokenizeTx = await assetTokenizer.connect(borrower).tokenizeAsset(
    "Commercial Real Estate",
    500000,
    "QmHash123",
    owner.address
  );
  const receipt = await tokenizeTx.wait();
  const tokenId = 0; // First token
  console.log("Tokenized RWA: ID #0");

  // 3. Create Loan
  console.log("\n--- Step 3: Loan Creation ---");
  await assetTokenizer.connect(borrower).approve(addresses.LoanFactory, tokenId);
  const createLoanTx = await loanFactory.connect(borrower).createLoan(
    tokenId,
    hre.ethers.parseUnits("1000", 6), // $1000 principal
    500, // 5% interest
    3600 * 24 * 30 // 30 days
  );
  await createLoanTx.wait();
  console.log("Created Loan from RWA #0. Principal: 1000 USDC.");

  // 4. Wrap into Portfolio
  console.log("\n--- Step 4: Portfolio Wrapping ---");
  const loan = await loanFactory.loans(0);
  const loanTokenAddress = loan.loanToken;
  
  const composition = [
    { token: loanTokenAddress, weight: 10000 } // 100% weight to this loan
  ];
  
  const createPortfolioTx = await portfolioFactory.connect(investor).createPortfolio(
    "Diversified RWA Fund",
    "DRWA",
    composition,
    hre.ethers.parseUnits("100", 18)
  );
  await createPortfolioTx.wait();
  console.log("Created Portfolio 'DRWA' containing Loan #0 position.");

  console.log("\n✅ E2E logic verification complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
