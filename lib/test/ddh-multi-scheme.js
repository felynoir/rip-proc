"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const bigint_mod_arith_1 = require("bigint-mod-arith");
const ddh_scheme_1 = require("./ddh-scheme");
const mathjs_1 = require("mathjs");
describe("DDH-multi scheme", function () {
    async function deploy(aclName) {
        const DDH = await hardhat_1.ethers.getContractFactory("DDHMulti");
        const ddhm = await DDH.deploy(2, 3, 2 ** 10);
        await ddhm.waitForDeployment();
        return { ddhm, ddhmAddress: await ddhm.getAddress() };
    }
    it("should have equal product result", async function () {
        const { ddhm } = await deploy();
        await (await ddhm.generateMultiMasterKeys()).wait();
        // const masterPubKey = await ddhm..staticCallResult(0);
        const xs = [
            [2, 3, 5],
            [4, 5, 6],
        ];
        const ys = [
            [1, 1, 6],
            [2, 2, 7],
        ];
        await (await ddhm.deriveMultiKey(0, ys)).wait();
        await (await ddhm.multiEncrypt(0, xs)).wait();
        const ciphers = await ddhm.getEncrypedText.staticCallResult(0);
        const fKeys = await ddhm.getFunctionKey.staticCallResult(0);
        const P = 303951732001538966662735198097427004967n;
        const G = 139782000973099010998056607764611120709n;
        let results = [];
        for (let slot = 0; slot < 2; slot++) {
            let num = 1n;
            for (let i = 1; i < ciphers[slot].length; i++) {
                const t1 = (0, bigint_mod_arith_1.modPow)(ciphers[slot][i], BigInt(ys[slot][i - 1]), P);
                num = (num * t1) % P;
            }
            const denom = (0, bigint_mod_arith_1.modPow)(ciphers[slot][0], fKeys[slot], P);
            const denomInv = (0, bigint_mod_arith_1.modInv)(denom, P);
            const r = (num * denomInv) % P;
            const bound = 1n * (2n ** 10n) ** 2n;
            const bb = (0, ddh_scheme_1.sqrt)(bound) + 1n;
            const result = (0, ddh_scheme_1.babyStepGiantStep)(G, r, P, bb);
            if (result === null) {
                throw new Error("Failed to find the discrete logarithm within bound");
            }
            results.push(result);
        }
        // Decrypt for all slots
        await (await ddhm.multiDecrypt(0, results)).wait();
        const expectedSum = (0, mathjs_1.dot)(xs[0], ys[0]) + (0, mathjs_1.dot)(xs[1], ys[1]);
        const actualSum = Number(results[0]) + Number(results[1]);
        (0, chai_1.expect)(actualSum).to.equal(expectedSum);
    });
});
//# sourceMappingURL=ddh-multi-scheme.js.map