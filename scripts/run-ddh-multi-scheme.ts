// Usage: pnpm hardhat run --network <network> scripts/run-ddh-multi-scheme.ts

import { ethers } from "hardhat";

async function main() {
  const DDHM = await ethers.getContractFactory("DDHMulti");
  const ddhm = await DDHM.deploy(2, 3, 2 ** 10);
  console.log("DDHMulti deployed to:", await ddhm.getAddress());

  const tx = await ddhm.generateMultiMasterKeys();
  console.log("Generated master keys", tx.hash);
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
