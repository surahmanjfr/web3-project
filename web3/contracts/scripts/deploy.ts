import { ethers } from "ethers";
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  const MyToken = await hre.viem.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();

  console.log("MyToken deployed to:", myToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });