const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(typeof chaiAsPromised === 'function' ? chaiAsPromised : chaiAsPromised.default);
const expect = chai.expect;
const sinon = require("sinon");
const axios = require("axios");
const StrategyParser = require("../scripts/agents/StrategyParser");

describe("StrategyParser", function () {
  let strategyParser;
  let axiosStub;

  beforeEach(function () {
    strategyParser = new StrategyParser();
    axiosStub = sinon.stub(axios, "post");
  });

  afterEach(function () {
    axiosStub.restore();
  });

  describe("parseUserIntent", function () {
    it("Should call Ollama and return parsed JSON strategy", async function () {
      const userDesc = "rebalance my ETH and USDC portfolio if ETH drops below $2000";
      const mockResult = {
        type: "rebalancing",
        triggers: [{ condition: "price < 2000", threshold: 2000 }],
        actions: [{ type: "swap", params: { from: "USDC", to: "ETH" } }],
        constraints: { maxSlippage: 0.01 }
      };

      axiosStub.resolves({
        data: { response: JSON.stringify(mockResult) }
      });

      const result = await strategyParser.parseUserIntent(userDesc);

      expect(axiosStub.calledOnce).to.be.true;
      expect(result.type).to.equal("rebalancing");
      expect(result.triggers[0].threshold).to.equal(2000);
    });

    it("Should throw error if response is not valid JSON", async function () {
      axiosStub.resolves({
        data: { response: "Invalid JSON" }
      });

      await expect(strategyParser.parseUserIntent("test"))
        .to.be.rejectedWith("Failed to parse LLM response");
    });
  });

  describe("optimizeStrategy", function () {
    it("Should call Ollama and return optimization suggestions", async function () {
      const strategy = { type: "lending" };
      const marketData = { usdcAPY: 0.05 };
      const mockOptimization = {
        suggestedChanges: ["increase collateral factor"],
        riskScore: 30,
        expectedAPY: "6%"
      };

      axiosStub.resolves({
        data: { response: JSON.stringify(mockOptimization) }
      });

      const result = await strategyParser.optimizeStrategy(strategy, marketData);

      expect(axiosStub.calledOnce).to.be.true;
      expect(result.riskScore).to.equal(30);
      expect(result.expectedAPY).to.equal("6%");
    });
  });
});
