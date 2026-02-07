const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PortfolioToken", function () {
  let portfolioToken;
  let tokenA, tokenB, tokenC;
  let creator, investor;
  const TOTAL_SUPPLY = ethers.parseEther("1000000");

  beforeEach(async function () {
    [creator, investor] = await ethers.getSigners();

    // Deploy mock tokens for composition
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    tokenA = await MockERC20.deploy("Token A", "TKA", 18);
    tokenB = await MockERC20.deploy("Token B", "TKB", 18);
    tokenC = await MockERC20.deploy("Token C", "TKC", 18);
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
    await tokenC.waitForDeployment();
  });

  describe("constructor", function () {
    it("Should create portfolio with valid composition", async function () {
      const composition = [
        { token: await tokenA.getAddress(), weight: 5000n }, // 50%
        { token: await tokenB.getAddress(), weight: 3000n }, // 30%
        { token: await tokenC.getAddress(), weight: 2000n }  // 20%
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Multi Asset Portfolio",
        "MAP",
        composition,
        TOTAL_SUPPLY
      );
      await portfolioToken.waitForDeployment();

      expect(await portfolioToken.name()).to.equal("Multi Asset Portfolio");
      expect(await portfolioToken.symbol()).to.equal("MAP");
      expect(await portfolioToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should mint total supply to creator", async function () {
      const composition = [
        { token: await tokenA.getAddress(), weight: 10000n } // 100%
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Single Asset Portfolio",
        "SAP",
        composition,
        TOTAL_SUPPLY
      );
      await portfolioToken.waitForDeployment();

      expect(await portfolioToken.balanceOf(creator.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should emit PortfolioCreated event", async function () {
      const composition = [
        { token: await tokenA.getAddress(), weight: 6000n },
        { token: await tokenB.getAddress(), weight: 4000n }
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Dual Asset Portfolio",
        "DAP",
        composition,
        TOTAL_SUPPLY
      );

      await expect(portfolioToken.waitForDeployment())
        .to.not.be.reverted;
    });

    it("Should revert for empty portfolio", async function () {
      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      await expect(
        PortfolioToken.deploy("Empty", "EMPTY", [], TOTAL_SUPPLY)
      ).to.be.revertedWith("Empty portfolio");
    });

    it("Should revert if weights do not sum to 10000", async function () {
      const composition = [
        { token: await tokenA.getAddress(), weight: 5000n },
        { token: await tokenB.getAddress(), weight: 4000n } // Only 90%
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      await expect(
        PortfolioToken.deploy("Invalid", "INV", composition, TOTAL_SUPPLY)
      ).to.be.revertedWith("Weights must sum to 100%");
    });
  });

  describe("getComposition", function () {
    it("Should return correct composition array", async function () {
      const tokenAAddr = await tokenA.getAddress();
      const tokenBAddr = await tokenB.getAddress();

      const composition = [
        { token: tokenAAddr, weight: 7000n },
        { token: tokenBAddr, weight: 3000n }
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Test Portfolio",
        "TEST",
        composition,
        TOTAL_SUPPLY
      );
      await portfolioToken.waitForDeployment();

      const result = await portfolioToken.getComposition();
      expect(result.length).to.equal(2);
      expect(result[0].token).to.equal(tokenAAddr);
      expect(result[0].weight).to.equal(7000n);
      expect(result[1].token).to.equal(tokenBAddr);
      expect(result[1].weight).to.equal(3000n);
    });
  });

  describe("tokenIndex", function () {
    it("Should map tokens to their indices", async function () {
      const tokenAAddr = await tokenA.getAddress();
      const tokenBAddr = await tokenB.getAddress();

      const composition = [
        { token: tokenAAddr, weight: 5000n },
        { token: tokenBAddr, weight: 5000n }
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Index Test",
        "IDX",
        composition,
        TOTAL_SUPPLY
      );
      await portfolioToken.waitForDeployment();

      expect(await portfolioToken.tokenIndex(tokenAAddr)).to.equal(0n);
      expect(await portfolioToken.tokenIndex(tokenBAddr)).to.equal(1n);
    });
  });

  describe("ERC20 functionality", function () {
    beforeEach(async function () {
      const composition = [
        { token: await tokenA.getAddress(), weight: 10000n }
      ];

      const PortfolioToken = await ethers.getContractFactory("PortfolioToken");
      portfolioToken = await PortfolioToken.deploy(
        "Transfer Test",
        "TFR",
        composition,
        TOTAL_SUPPLY
      );
      await portfolioToken.waitForDeployment();
    });

    it("Should allow token transfers", async function () {
      const transferAmount = ethers.parseEther("1000");
      await portfolioToken.transfer(investor.address, transferAmount);

      expect(await portfolioToken.balanceOf(investor.address)).to.equal(transferAmount);
    });
  });
});
