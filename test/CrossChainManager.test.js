const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(typeof chaiAsPromised === 'function' ? chaiAsPromised : chaiAsPromised.default);
const expect = chai.expect;
const sinon = require("sinon");
const CrossChainManager = require("../scripts/integrations/CrossChainManager");

describe("CrossChainManager", function () {
  let crossChainManager, mockLifi;

  beforeEach(function () {
    mockLifi = {
      getQuote: sinon.stub(),
      executeRoute: sinon.stub()
    };
    crossChainManager = new CrossChainManager(mockLifi);
  });

  describe("depositCollateralFromAnyChain", function () {
    it("Should get quote and execute route for cross-chain deposit", async function () {
      const fromChain = 1; // Ethereum
      const toChain = 1516; // Arc
      const token = "0xTokenAddr";
      const amount = "1000000";
      const user = "0xUserAddr";

      const mockQuote = {
        routes: [{ id: "route1", steps: [] }]
      };
      mockLifi.getQuote.resolves(mockQuote);
      mockLifi.executeRoute.resolves({ status: "completed" });

      const result = await crossChainManager.depositCollateralFromAnyChain(
        fromChain, toChain, token, amount, user
      );

      expect(mockLifi.getQuote.calledOnce).to.be.true;
      expect(mockLifi.getQuote.getCall(0).args[0].toToken).to.equal("USDC");
      expect(mockLifi.executeRoute.calledOnce).to.be.true;
      expect(result.status).to.equal("completed");
    });
  });

  describe("rebalancePortfolio", function () {
    it("Should identify non-target chain positions and execute routes", async function () {
      const targetChain = 1516;
      const portfolio = {
        owner: "0xOwner",
        positions: [
          { chain: 1, token: "0xT1", amount: "100" },
          { chain: 1516, token: "0xT2", amount: "200" }, // Same chain, skip
          { chain: 137, token: "0xT3", amount: "300" }
        ]
      };

      const mockQuote1 = { routes: [{ id: "route1" }] };
      const mockQuote2 = { routes: [{ id: "route2" }] };
      
      mockLifi.getQuote.onCall(0).resolves(mockQuote1);
      mockLifi.getQuote.onCall(1).resolves(mockQuote2);
      mockLifi.executeRoute.resolves({ status: "success" });

      const results = await crossChainManager.rebalancePortfolio(portfolio, targetChain);

      expect(mockLifi.getQuote.callCount).to.equal(2);
      expect(mockLifi.executeRoute.callCount).to.equal(2);
      expect(results.length).to.equal(2);
    });

    it("Should return empty array for empty portfolio", async function () {
      const results = await crossChainManager.rebalancePortfolio({ owner: "0x", positions: [] }, 1516);
      expect(results).to.deep.equal([]);
      expect(mockLifi.getQuote.called).to.be.false;
    });
  });
});
