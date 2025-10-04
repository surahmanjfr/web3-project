import { expect } from "chai";
import { ethers } from "hardhat";
import { MyToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("MyToken", function () {
  let myToken: MyToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const MyToken = await ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();
    await myToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await myToken.owner()).to.equal(await owner.getAddress());
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await myToken.balanceOf(await owner.getAddress());
      expect(await myToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      await myToken.transfer(await addr1.getAddress(), 50);
      const addr1Balance = await myToken.balanceOf(await addr1.getAddress());
      expect(addr1Balance).to.equal(50);

      await myToken.connect(addr1).transfer(await addr2.getAddress(), 50);
      const addr2Balance = await myToken.balanceOf(await addr2.getAddress());
      expect(addr2Balance).to.equal(50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const initialOwnerBalance = await myToken.balanceOf(await owner.getAddress());
      await expect(
        myToken.connect(addr1).transfer(await owner.getAddress(), 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
      expect(await myToken.balanceOf(await owner.getAddress())).to.equal(
        initialOwnerBalance
      );
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await myToken.mint(await addr1.getAddress(), 100);
      expect(await myToken.balanceOf(await addr1.getAddress())).to.equal(100);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        myToken.connect(addr1).mint(await addr2.getAddress(), 100)
      ).to.be.revertedWithCustomError(myToken, "OwnableUnauthorizedAccount");
    });
  });
});