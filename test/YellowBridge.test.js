const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YellowBridge", function () {
  let yellowBridge, testToken;
  let owner, user, otherAccount;
  const INITIAL_AMOUNT = ethers.parseEther("1000");

  beforeEach(async function () {
    [owner, user, otherAccount] = await ethers.getSigners();

    // Deploy mock token for testing
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    testToken = await MockERC20.deploy("Test Token", "TEST", 18);
    await testToken.waitForDeployment();

    // Mint tokens to user
    await testToken.mint(user.address, INITIAL_AMOUNT);

    // Deploy YellowBridge
    const YellowBridge = await ethers.getContractFactory("YellowBridge");
    yellowBridge = await YellowBridge.deploy();
    await yellowBridge.waitForDeployment();
  });

  describe("startSession", function () {
    it("Should lock tokens and start a session", async function () {
      const depositAmount = ethers.parseEther("100");
      await testToken.connect(user).approve(await yellowBridge.getAddress(), depositAmount);

      const tx = await yellowBridge.connect(user).startSession(await testToken.getAddress(), depositAmount);
      const receipt = await tx.wait();

      // Find SessionStarted event
      const event = receipt.logs.find(log => {
        try {
          return yellowBridge.interface.parseLog(log)?.name === "SessionStarted";
        } catch { return false; }
      });
      const parsedEvent = yellowBridge.interface.parseLog(event);
      const sessionId = parsedEvent.args.sessionId;

      expect(sessionId).to.not.be.undefined;
      expect(await testToken.balanceOf(await yellowBridge.getAddress())).to.equal(depositAmount);
      
      const session = await yellowBridge.sessions(sessionId);
      expect(session.user).to.equal(user.address);
      expect(session.depositedAmount).to.equal(depositAmount);
      expect(session.token).to.equal(await testToken.getAddress());
      expect(session.isActive).to.be.true;
    });

    it("Should revert if amount is 0", async function () {
      await expect(
        yellowBridge.connect(user).startSession(await testToken.getAddress(), 0)
      ).to.be.revertedWith("Invalid amount");
    });
  });

  describe("settleSession", function () {
    let sessionId;
    const depositAmount = ethers.parseEther("100");

    beforeEach(async function () {
      await testToken.connect(user).approve(await yellowBridge.getAddress(), depositAmount);
      const tx = await yellowBridge.connect(user).startSession(await testToken.getAddress(), depositAmount);
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return yellowBridge.interface.parseLog(log)?.name === "SessionStarted";
        } catch { return false; }
      });
      sessionId = yellowBridge.interface.parseLog(event).args.sessionId;
    });

    it("Should settle session and return final balance", async function () {
      const finalBalance = ethers.parseEther("40");
      const userBalanceBefore = await testToken.balanceOf(user.address);

      await expect(yellowBridge.connect(user).settleSession(sessionId, finalBalance))
        .to.emit(yellowBridge, "SessionSettled")
        .withArgs(sessionId, finalBalance);

      expect(await testToken.balanceOf(user.address)).to.equal(userBalanceBefore + finalBalance);
      
      const session = await yellowBridge.sessions(sessionId);
      expect(session.isActive).to.be.false;
    });

    it("Should revert if session is not active", async function () {
      await yellowBridge.connect(user).settleSession(sessionId, 0);
      await expect(
        yellowBridge.connect(user).settleSession(sessionId, 0)
      ).to.be.revertedWith("Session not active");
    });

    it("Should revert if caller is not session owner", async function () {
      await expect(
        yellowBridge.connect(otherAccount).settleSession(sessionId, 0)
      ).to.be.revertedWith("Not session owner");
    });

    it("Should revert if final balance exceeds deposit", async function () {
      await expect(
        yellowBridge.connect(user).settleSession(sessionId, depositAmount + 1n)
      ).to.be.revertedWith("Invalid final balance");
    });
  });
});
