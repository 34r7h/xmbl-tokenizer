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
      
      // Fix timestamp for next block
      const timestamp = (await ethers.provider.getBlock("latest")).timestamp + 100;
      await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
      await ethers.provider.send("evm_mine");

      // First registration
      await agentExecutor.connect(user).registerStrategy(strategyType, ethers.hexlify(ethers.toUtf8Bytes(strategyData)));

      // Second registration with SAME timestamp and SAME params (must set next block timestamp again)
      await ethers.provider.send("evm_setNextBlockTimestamp", [timestamp]);
      // Note: In real life timestamps increment, but for test coverage of the require check:
      await expect(
        agentExecutor.connect(user).registerStrategy(strategyType, ethers.hexlify(ethers.toUtf8Bytes(strategyData)))
      ).to.be.revertedWith("Strategy ID collision");
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
