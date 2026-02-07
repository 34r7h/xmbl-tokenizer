const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(typeof chaiAsPromised === 'function' ? chaiAsPromised : chaiAsPromised.default);
const expect = chai.expect;
const sinon = require("sinon");
const { ethers } = require("hardhat");
const OrderBookManager = require("../scripts/integrations/OrderBookManager");

describe("OrderBookManager", function () {
  let orderBookManager, yellowClient, yellowBridge, testToken;
  let owner, user;
  const SESSION_ID = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy Mock Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    testToken = await MockERC20.deploy("Test", "TST", 18);
    await testToken.waitForDeployment();
    await testToken.mint(user.address, ethers.parseEther("1000"));

    // Deploy YellowBridge
    const YellowBridge = await ethers.getContractFactory("YellowBridge");
    yellowBridge = await YellowBridge.deploy();
    await yellowBridge.waitForDeployment();

    // Mock YellowClient
    yellowClient = {
      placeOrder: sinon.stub(),
      settleSession: sinon.stub(),
      cancelOrder: sinon.stub()
    };

    orderBookManager = new OrderBookManager(yellowClient, yellowBridge.connect(user));
  });

  describe("createLimitOrder", function () {
    it("Should start bridge session and place off-chain order", async function () {
      const amount = ethers.parseEther("100");
      const price = 1.05;
      const tokenAddr = await testToken.getAddress();
      
      await testToken.connect(user).approve(await yellowBridge.getAddress(), amount);
      
      const mockOrder = { id: "order1", status: "open" };
      yellowClient.placeOrder.resolves(mockOrder);

      const order = await orderBookManager.createLimitOrder(tokenAddr, amount, price, "buy");

      expect(yellowClient.placeOrder.calledOnce).to.be.true;
      const args = yellowClient.placeOrder.getCall(0).args;
      expect(args[0]).to.be.a("string"); // sessionId
      expect(args[1].type).to.equal("limit");
      expect(order).to.deep.equal(mockOrder);
      
      expect(await testToken.balanceOf(await yellowBridge.getAddress())).to.equal(amount);
    });
  });

  describe("executeMarketOrder", function () {
    it("Should start session, place order, and settle immediately", async function () {
      const amount = ethers.parseEther("50");
      const tokenAddr = await testToken.getAddress();
      
      await testToken.connect(user).approve(await yellowBridge.getAddress(), amount);
      
      const mockResult = { txHash: "0xresult", status: "filled" };
      yellowClient.placeOrder.resolves(mockResult);
      yellowClient.settleSession.resolves();

      const result = await orderBookManager.executeMarketOrder(tokenAddr, amount, "sell");

      expect(yellowClient.placeOrder.calledOnce).to.be.true;
      expect(yellowClient.settleSession.calledOnce).to.be.true;
      expect(result).to.deep.equal(mockResult);
    });
  });

  describe("cancelOrder", function () {
    it("Should place cancel order and settle session", async function () {
      const amount = ethers.parseEther("10");
      const tokenAddr = await testToken.getAddress();
      await testToken.connect(user).approve(await yellowBridge.getAddress(), amount);
      
      const mockOrder = { id: "order2" };
      yellowClient.placeOrder.resolves(mockOrder);

      await orderBookManager.createLimitOrder(tokenAddr, amount, 1.0, "buy");
      
      yellowClient.settleSession.resolves();
      await orderBookManager.cancelOrder("order2");

      expect(yellowClient.settleSession.calledOnce).to.be.true;
      expect(orderBookManager.activeOrders.has("order2")).to.be.false;
    });

    it("Should throw if order not found", async function () {
      await expect(orderBookManager.cancelOrder("nonexistent")).to.be.rejectedWith("Order not found");
    });
  });
});
