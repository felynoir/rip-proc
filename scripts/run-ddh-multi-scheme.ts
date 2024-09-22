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
    [3n, 5n, 5n, 10n, 1n, 2n, 3n, 4n, 5n, 6n],
    [4n, 6n, 2n, 3n, 6n, 11n, 7n, 8n, 9n, 10n],
  ];
  const tx2 = await ddhm.deriveMultiKey(0, ys);
  await tx2.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
