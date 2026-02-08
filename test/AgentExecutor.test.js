const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgentExecutor", function () {
  let agentExecutor;
  let owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    const AgentExecutor = await ethers.getContractFactory("AgentExecutor");
    agentExecutor = await AgentExecutor.deploy();
    await agentExecutor.waitForDeployment();
  });

  describe("registerStrategy", function () {
    it("Should register a strategy and emit StrategyRegistered event", async function () {
      const strategyType = "rebalancing";
      const strategyData = ethers.hexlify(ethers.toUtf8Bytes("some data"));

      const tx = await agentExecutor.connect(user).registerStrategy(strategyType, strategyData);
      const receipt = await tx.wait();

      // Find StrategyRegistered event
      const event = receipt.logs.find(log => {
        try {
          return agentExecutor.interface.parseLog(log)?.name === "StrategyRegistered";
        } catch { return false; }
      });
      const parsedEvent = agentExecutor.interface.parseLog(event);
      const strategyId = parsedEvent.args.strategyId;

      expect(strategyId).to.not.be.undefined;
      
      const strategy = await agentExecutor.strategies(strategyId);
      expect(strategy.owner).to.equal(user.address);
      expect(strategy.strategyType).to.equal(strategyType);
      expect(strategy.isActive).to.be.true;
      
      const userStrats = await agentExecutor.userStrategies(user.address, 0);
      expect(userStrats).to.equal(strategyId);
    });

    it("Should revert on strategy ID collision", async function () {
      const strategyType = "rebalancing";
      const strategyData = "0x";
      
      // Disable auto-mining to include multiple txs in one block
      await ethers.provider.send("evm_setAutomine", [false]);

      // Submit two identical transactions
      const tx1 = await agentExecutor.connect(user).registerStrategy(strategyType, ethers.hexlify(ethers.toUtf8Bytes(strategyData)));
      
      // The second one should fail upon execution because it generates the same ID in the same block
      const tx2 = await agentExecutor.connect(user).registerStrategy(strategyType, ethers.hexlify(ethers.toUtf8Bytes(strategyData)));

      // Mine the block containing both txs
      await ethers.provider.send("evm_mine", []);
      
      // Re-enable auto-mining
      await ethers.provider.send("evm_setAutomine", [true]);

      // First one should succeed
      await tx1.wait();

      // Second one should fail
      await expect(tx2.wait()).to.be.reverted;
    });
  });

  describe("executeStrategy", function () {
    it("Should update lastExecuted timestamp and emit StrategyExecuted event", async function () {
      const strategyType = "lending";
      const strategyData = "0x";
      
      const txReg = await agentExecutor.connect(user).registerStrategy(strategyType, ethers.hexlify(ethers.toUtf8Bytes(strategyData)));
      const receiptReg = await txReg.wait();
      const strategyId = agentExecutor.interface.parseLog(receiptReg.logs[0]).args.strategyId;

      const actionData = ethers.hexlify(ethers.toUtf8Bytes("action payload"));
      
      const txExec = await agentExecutor.connect(user).executeStrategy(strategyId, actionData);
      
      await expect(txExec)
        .to.emit(agentExecutor, "StrategyExecuted")
        .withArgs(strategyId, anyValue => true); // timestamp

      const strategy = await agentExecutor.strategies(strategyId);
      expect(strategy.lastExecuted).to.be.gt(0n);
    });

    it("Should revert if strategy is not active", async function () {
      const strategyId = ethers.keccak256(ethers.toUtf8Bytes("fake id"));
      await expect(
        agentExecutor.executeStrategy(strategyId, "0x")
      ).to.be.revertedWith("Strategy not active");
    });
  });

  describe("setStrategyStatus", function () {
    let strategyId;

    beforeEach(async function () {
      const tx = await agentExecutor.connect(user).registerStrategy("test", "0x");
      const receipt = await tx.wait();
      strategyId = agentExecutor.interface.parseLog(receipt.logs[0]).args.strategyId;
    });

    it("Should allow owner to toggle status", async function () {
      await agentExecutor.connect(user).setStrategyStatus(strategyId, false);
      const strategy = await agentExecutor.strategies(strategyId);
      expect(strategy.isActive).to.be.false;
    });

    it("Should revert if non-owner attempts toggle", async function () {
      await expect(
        agentExecutor.connect(owner).setStrategyStatus(strategyId, false)
      ).to.be.revertedWith("Not owner");
    });
  });
});
