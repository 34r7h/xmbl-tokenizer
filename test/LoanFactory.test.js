const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanFactory", function () {
  let loanFactory, assetTokenizer, usdc;
  let owner, borrower, lender;
  let collateralTokenId;

  beforeEach(async function () {
    [owner, borrower, lender] = await ethers.getSigners();

    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Deploy AssetTokenizer
    const AssetTokenizer = await ethers.getContractFactory("AssetTokenizer");
    assetTokenizer = await AssetTokenizer.deploy();
    await assetTokenizer.waitForDeployment();

    // Deploy LoanFactory
    const LoanFactory = await ethers.getContractFactory("LoanFactory");
    loanFactory = await LoanFactory.deploy(
      await usdc.getAddress(),
      await assetTokenizer.getAddress()
    );
    await loanFactory.waitForDeployment();

    // Mint USDC to loan factory (liquidity pool)
    await usdc.mint(await loanFactory.getAddress(), ethers.parseUnits("1000000", 6));

    // Borrower tokenizes an asset as collateral
    const tx = await assetTokenizer.connect(borrower).tokenizeAsset(
      "real_estate",
      300000n,
      "QmPropertyDocHash",
      owner.address
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => {
      try {
        return assetTokenizer.interface.parseLog(log)?.name === "AssetTokenized";
      } catch { return false; }
    });
    collateralTokenId = assetTokenizer.interface.parseLog(event).args.tokenId;
  });

  describe("constructor", function () {
    it("Should set USDC and assetTokenizer addresses", async function () {
      expect(await loanFactory.USDC()).to.equal(await usdc.getAddress());
      expect(await loanFactory.assetTokenizer()).to.equal(await assetTokenizer.getAddress());
    });
  });

  describe("createLoan", function () {
    it("Should create a collateralized loan successfully", async function () {
      // Approve collateral transfer
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      const principal = ethers.parseUnits("100000", 6); // $100k
      const interestRate = 500n; // 5%
      const duration = 365n * 24n * 60n * 60n; // 1 year

      const tx = await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        principal,
        interestRate,
        duration
      );

      await expect(tx).to.emit(loanFactory, "LoanCreated");

      // Verify loan struct
      const loan = await loanFactory.loans(0n);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.principalUSDC).to.equal(principal);
      expect(loan.interestRate).to.equal(interestRate);
      expect(loan.status).to.equal(0n); // Active
    });

    it("Should transfer USDC to borrower", async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      const principal = ethers.parseUnits("50000", 6);
      const balanceBefore = await usdc.balanceOf(borrower.address);

      await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        principal,
        300n,
        180n * 24n * 60n * 60n
      );

      expect(await usdc.balanceOf(borrower.address)).to.equal(balanceBefore + principal);
    });

    it("Should lock collateral in factory", async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        ethers.parseUnits("25000", 6),
        200n,
        90n * 24n * 60n * 60n
      );

      expect(await assetTokenizer.ownerOf(collateralTokenId)).to.equal(await loanFactory.getAddress());
    });

    it("Should deploy a LoanToken for the loan", async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        ethers.parseUnits("10000", 6),
        100n,
        30n * 24n * 60n * 60n
      );

      const loan = await loanFactory.loans(0n);
      expect(loan.loanToken).to.not.equal(ethers.ZeroAddress);
    });

    it("Should revert if caller is not collateral owner", async function () {
      await expect(
        loanFactory.connect(lender).createLoan(
          collateralTokenId,
          ethers.parseUnits("10000", 6),
          100n,
          30n * 24n * 60n * 60n
        )
      ).to.be.revertedWith("Not collateral owner");
    });

    it("Should revert for zero principal", async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      await expect(
        loanFactory.connect(borrower).createLoan(
          collateralTokenId,
          0n,
          100n,
          30n * 24n * 60n * 60n
        )
      ).to.be.revertedWith("Invalid principal");
    });
  });

  describe("repayLoan", function () {
    let loanId;
    let totalOwed;

    beforeEach(async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      const principal = ethers.parseUnits("10000", 6);
      const interestRate = 500n; // 5%

      await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        principal,
        interestRate,
        30n * 24n * 60n * 60n
      );

      loanId = 0n;
      const loan = await loanFactory.loans(loanId);
      totalOwed = loan.totalOwed;

      // Mint extra USDC to borrower for repayment (interest)
      await usdc.mint(borrower.address, totalOwed);
    });

    it("Should allow borrower to repay loan", async function () {
      await usdc.connect(borrower).approve(await loanFactory.getAddress(), totalOwed);

      const tx = await loanFactory.connect(borrower).repayLoan(loanId);
      await expect(tx).to.emit(loanFactory, "LoanRepaid").withArgs(loanId, totalOwed);

      const loan = await loanFactory.loans(loanId);
      expect(loan.status).to.equal(1n); // Repaid
    });

    it("Should return collateral to borrower", async function () {
      await usdc.connect(borrower).approve(await loanFactory.getAddress(), totalOwed);
      await loanFactory.connect(borrower).repayLoan(loanId);

      expect(await assetTokenizer.ownerOf(collateralTokenId)).to.equal(borrower.address);
    });

    it("Should revert if not borrower", async function () {
      await usdc.mint(lender.address, totalOwed);
      await usdc.connect(lender).approve(await loanFactory.getAddress(), totalOwed);

      await expect(
        loanFactory.connect(lender).repayLoan(loanId)
      ).to.be.revertedWith("Not borrower");
    });

    it("Should revert if loan already repaid", async function () {
      await usdc.connect(borrower).approve(await loanFactory.getAddress(), totalOwed);
      await loanFactory.connect(borrower).repayLoan(loanId);

      await usdc.mint(borrower.address, totalOwed);
      await usdc.connect(borrower).approve(await loanFactory.getAddress(), totalOwed);

      await expect(
        loanFactory.connect(borrower).repayLoan(loanId)
      ).to.be.revertedWith("Loan not active");
    });
  });

  describe("borrowerLoans", function () {
    it("Should track loans per borrower", async function () {
      await assetTokenizer.connect(borrower).approve(await loanFactory.getAddress(), collateralTokenId);

      await loanFactory.connect(borrower).createLoan(
        collateralTokenId,
        ethers.parseUnits("5000", 6),
        100n,
        30n * 24n * 60n * 60n
      );

      const loans = await loanFactory.borrowerLoans(borrower.address, 0n);
      expect(loans).to.equal(0n);
    });
  });
});
