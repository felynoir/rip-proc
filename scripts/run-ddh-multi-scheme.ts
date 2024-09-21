// Usage: pnpm hardhat run --network <network> scripts/run-ddh-multi-scheme.ts

import { ethers } from "hardhat";

async function main() {
  const DDHM = await ethers.getContractFactory("DDHMulti");
  const ddhm = await DDHM.deploy(2, 10, 2 ** 10);
  console.log("DDHMulti deployed to:", await ddhm.getAddress());

  const tx = await ddhm.generateMultiMasterKeys();
  await tx.wait();
  console.log("Generated master keys", tx.hash);
  const ys = [
    [3, 5, 5, 10, 1, 2, 3, 4, 5, 6],
    [4, 6, 2, 3, 6, 11, 7, 8, 9, 10],
  ];
  const tx2 = await ddhm.deriveMultiKey(0, ys);
  await tx2.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
