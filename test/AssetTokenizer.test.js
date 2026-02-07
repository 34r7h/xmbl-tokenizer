const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AssetTokenizer", function () {
  let assetTokenizer;
  let owner, appraiser, user, recipient;

  beforeEach(async function () {
    [owner, appraiser, user, recipient] = await ethers.getSigners();

    const AssetTokenizer = await ethers.getContractFactory("AssetTokenizer");
    assetTokenizer = await AssetTokenizer.deploy();
    await assetTokenizer.waitForDeployment();
  });

  describe("tokenizeAsset", function () {
    it("Should tokenize a real-world asset and emit AssetTokenized event", async function () {
      const assetType = "real_estate";
      const valuationUSD = 500000n;
      const documentHash = "QmHash123456789";
      const appraiserAddr = appraiser.address;

      const tx = await assetTokenizer.connect(user).tokenizeAsset(
        assetType,
        valuationUSD,
        documentHash,
        appraiserAddr
      );

      const receipt = await tx.wait();

      // Verify event emission
      await expect(tx)
        .to.emit(assetTokenizer, "AssetTokenized")
        .withArgs(0n, user.address, assetType, valuationUSD);

      // Verify ownership
      expect(await assetTokenizer.ownerOf(0n)).to.equal(user.address);
    });

    it("Should store correct asset metadata", async function () {
      const assetType = "invoice";
      const valuationUSD = 10000n;
      const documentHash = "QmInvoiceHash";
      const appraiserAddr = appraiser.address;

      await assetTokenizer.connect(user).tokenizeAsset(
        assetType,
        valuationUSD,
        documentHash,
        appraiserAddr
      );

      const asset = await assetTokenizer.getAsset(0n);

      expect(asset.assetType).to.equal(assetType);
      expect(asset.valuationUSD).to.equal(valuationUSD);
      expect(asset.documentHash).to.equal(documentHash);
      expect(asset.appraiser).to.equal(appraiserAddr);
      expect(asset.isActive).to.be.true;
      expect(asset.createdAt).to.be.greaterThan(0n);
    });

    it("Should increment tokenId for subsequent mints", async function () {
      // Mint first asset
      await assetTokenizer.connect(user).tokenizeAsset(
        "real_estate",
        100000n,
        "QmHash1",
        appraiser.address
      );

      // Mint second asset
      const tx = await assetTokenizer.connect(user).tokenizeAsset(
        "equipment",
        50000n,
        "QmHash2",
        appraiser.address
      );

      await expect(tx)
        .to.emit(assetTokenizer, "AssetTokenized")
        .withArgs(1n, user.address, "equipment", 50000n);

      expect(await assetTokenizer.ownerOf(1n)).to.equal(user.address);
    });
  });

  describe("getAsset", function () {
    it("Should revert for non-existent token", async function () {
      await expect(assetTokenizer.getAsset(999n))
        .to.be.revertedWith("Asset does not exist");
    });
  });

  describe("transferFrom", function () {
    it("Should allow asset ownership transfer", async function () {
      await assetTokenizer.connect(user).tokenizeAsset(
        "invoice",
        25000n,
        "QmTransferTest",
        appraiser.address
      );

      await assetTokenizer.connect(user).transferFrom(
        user.address,
        recipient.address,
        0n
      );

      expect(await assetTokenizer.ownerOf(0n)).to.equal(recipient.address);
    });

    it("Should revert if non-owner attempts transfer", async function () {
      await assetTokenizer.connect(user).tokenizeAsset(
        "equipment",
        15000n,
        "QmEquipment",
        appraiser.address
      );

      await expect(
        assetTokenizer.connect(recipient).transferFrom(
          user.address,
          recipient.address,
          0n
        )
      ).to.be.reverted;
    });
  });

  describe("ERC721 compliance", function () {
    it("Should return correct name and symbol", async function () {
      expect(await assetTokenizer.name()).to.equal("RWA Token");
      expect(await assetTokenizer.symbol()).to.equal("RWA");
    });
  });
});
