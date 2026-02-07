const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(typeof chaiAsPromised === 'function' ? chaiAsPromised : chaiAsPromised.default);
const expect = chai.expect;
const sinon = require("sinon");
const YellowClient = require("../scripts/integrations/YellowClient");

describe("YellowClient", function () {
  let yellowClient, mockSdk;
  const SESSION_ID = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  beforeEach(function () {
    mockSdk = {
      createSession: sinon.stub(),
      trade: sinon.stub(),
      settleSession: sinon.stub()
    };
    yellowClient = new YellowClient(mockSdk);
  });

  describe("createSession", function () {
    it("Should call sdk.createSession with correct parameters", async function () {
      const token = "0xTokenAddress";
      const amount = 1000;
      const mockSession = { id: SESSION_ID, status: "active" };
      mockSdk.createSession.resolves(mockSession);

      const session = await yellowClient.createSession(token, amount);

      expect(mockSdk.createSession.calledOnce).to.be.true;
      const args = mockSdk.createSession.getCall(0).args[0];
      expect(args.token).to.equal(token);
      expect(args.amount).to.equal(amount);
      expect(args.allowances.maxPerTrade).to.equal(amount * 0.1);
      expect(session).to.deep.equal(mockSession);
    });

    it("Should throw error if amount is <= 0", async function () {
      await expect(yellowClient.createSession("0xToken", 0)).to.be.rejectedWith("Invalid amount");
    });
  });

  describe("placeOrder", function () {
    it("Should call sdk.trade with correct parameters", async function () {
      const order = {
        type: "limit",
        pair: "USDC/LOAN1",
        side: "buy",
        amount: 100,
        price: 1.05
      };
      const mockResult = { txHash: "0xhash", status: "filled" };
      mockSdk.trade.resolves(mockResult);

      const result = await yellowClient.placeOrder(SESSION_ID, order);

      expect(mockSdk.trade.calledOnce).to.be.true;
      const args = mockSdk.trade.getCall(0).args[0];
      expect(args.sessionId).to.equal(SESSION_ID);
      expect(args.type).to.equal(order.type);
      expect(args.amount).to.equal(order.amount);
      expect(result).to.deep.equal(mockResult);
    });

    it("Should throw if sessionId is missing", async function () {
      await expect(yellowClient.placeOrder(null, {})).to.be.rejectedWith("Session ID required");
    });
  });

  describe("settleSession", function () {
    it("Should call sdk.settleSession with correct sessionId", async function () {
      const mockSettlement = { txHash: "0xSettlementHash" };
      mockSdk.settleSession.resolves(mockSettlement);

      const result = await yellowClient.settleSession(SESSION_ID);

      expect(mockSdk.settleSession.calledOnce).to.be.true;
      expect(mockSdk.settleSession.calledWith(SESSION_ID)).to.be.true;
      expect(result).to.deep.equal(mockSettlement);
    });

    it("Should throw if sessionId is missing", async function () {
      await expect(yellowClient.settleSession(null)).to.be.rejectedWith("Session ID required");
    });
  });
});
