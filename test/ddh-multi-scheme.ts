import { expect } from "chai";
import { ethers } from "hardhat";
import { modPow, modInv } from "bigint-mod-arith";
import { babyStepGiantStep, sqrt } from "./ddh-scheme";
import { dot } from "mathjs";

describe("DDH-multi scheme", function () {
  async function deploy(aclName?: string) {
    const DDH = await ethers.getContractFactory("DDHMulti");
    const ddhm = await DDH.deploy(2, 10, 2 ** 10);
    await ddhm.waitForDeployment();

    return { ddhm, ddhmAddress: await ddhm.getAddress() };
  }

  it("should have equal product result", async function () {
    const { ddhm } = await deploy();

    await (await ddhm.generateMultiMasterKeys()).wait();
    const xs = [
      [2, 3, 5, 6, 7, 8, 9, 10, 11, 12],
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    ];
    const ys = [
      [1, 1, 6, 7, 8, 9, 10, 11, 12, 13],
      [2, 2, 7, 8, 9, 10, 11, 12, 13, 14],
    ];

    await (await ddhm.deriveMultiKey(0, ys)).wait();
    await (await ddhm.multiEncrypt(0, xs)).wait();

    const [ciphers] = await ddhm.getAllEncryptedText.staticCallResult(0);
    const [fKeys] = await ddhm.getAllFunctionKeys.staticCallResult(0);

    const P = 303951732001538966662735198097427004967n;
    const G = 139782000973099010998056607764611120709n;

    let results: bigint[] = [];

    for (let slot = 0; slot < 2; slot++) {
      let num = 1n;
      for (let i = 1; i < ciphers[slot].length; i++) {
        const t1 = modPow(ciphers[slot][i], BigInt(ys[slot][i - 1]), P);
        num = (num * t1) % P;
      }
      const denom = modPow(ciphers[slot][0], fKeys[slot], P);
      const denomInv = modInv(denom, P);
      const r = (num * denomInv) % P;
      const bound = 3n * (2n ** 10n) ** 2n;
      const bb = sqrt(bound) + 1n;
      const result = babyStepGiantStep(G, r, P, bb);
      if (result === null) {
        throw new Error("Failed to find the discrete logarithm within bound");
      }
      results.push(result);
    }

    // Decrypt for all slots
    await (await ddhm.multiDecrypt(0, results)).wait();

    const expectedSum = dot(xs[0], ys[0]) + dot(xs[1], ys[1]);
    const actualSum = Number(results[0]) + Number(results[1]);

    expect(actualSum).to.equal(expectedSum);
  });
});
