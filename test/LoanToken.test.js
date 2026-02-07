const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LoanToken", function () {
  let loanToken;
  let deployer, recipient;
  const LOAN_ID = 42n;
  const TOTAL_SUPPLY = ethers.parseEther("1000000"); // 1M tokens

  beforeEach(async function () {
    [deployer, recipient] = await ethers.getSigners();

    const LoanToken = await ethers.getContractFactory("LoanToken");
    loanToken = await LoanToken.deploy(
      "Loan #42",
      "LOAN42",
      LOAN_ID,
      TOTAL_SUPPLY
    );
    await loanToken.waitForDeployment();
  });

  describe("constructor", function () {
    it("Should set correct name and symbol", async function () {
      expect(await loanToken.name()).to.equal("Loan #42");
      expect(await loanToken.symbol()).to.equal("LOAN42");
    });

    it("Should mint total supply to deployer", async function () {
      expect(await loanToken.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await loanToken.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should store loanContract as deployer address", async function () {
      expect(await loanToken.loanContract()).to.equal(deployer.address);
    });

    it("Should store correct loanId", async function () {
      expect(await loanToken.loanId()).to.equal(LOAN_ID);
    });
  });

  describe("getLoanInfo", function () {
    it("Should return correct loan contract and loan id", async function () {
      const [loanContract, loanId] = await loanToken.getLoanInfo();
      expect(loanContract).to.equal(deployer.address);
      expect(loanId).to.equal(LOAN_ID);
    });
  });

  describe("ERC20 functionality", function () {
    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      await loanToken.transfer(recipient.address, transferAmount);

      expect(await loanToken.balanceOf(recipient.address)).to.equal(transferAmount);
      expect(await loanToken.balanceOf(deployer.address)).to.equal(TOTAL_SUPPLY - transferAmount);
    });

    it("Should allow approved transfers", async function () {
      const approveAmount = ethers.parseEther("500");
      await loanToken.approve(recipient.address, approveAmount);

      expect(await loanToken.allowance(deployer.address, recipient.address)).to.equal(approveAmount);

      await loanToken.connect(recipient).transferFrom(
        deployer.address,
        recipient.address,
        approveAmount
      );

      expect(await loanToken.balanceOf(recipient.address)).to.equal(approveAmount);
    });

    it("Should have 18 decimals", async function () {
      expect(await loanToken.decimals()).to.equal(18);
    });
  });
});
