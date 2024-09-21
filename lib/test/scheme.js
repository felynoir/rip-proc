"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const bigint_mod_arith_1 = require("bigint-mod-arith");
const dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
function bigintLog2Floor(n) {
    if (n <= 0n) {
        throw new Error("Input must be a positive integer.");
    }
    let log = 0n;
    while (n >= 1n) {
        n /= 2n;
        log += 1n;
    }
    return log;
}
function sqrt(value) {
    if (value < 0n) {
        throw "square root of negative numbers is not supported";
    }
    if (value < 2n) {
        return value;
    }
    function newtonIteration(n, x0) {
        const x1 = (n / x0 + x0) >> 1n;
        if (x0 === x1 || x0 === x1 - 1n) {
            return x0;
        }
        return newtonIteration(n, x1);
    }
    return newtonIteration(value, 1n);
}
/**
 * Baby Step Giant Step Algorithm to solve g^x ≡ h (mod p)
 * Finds the discrete logarithm x such that g^x = h mod p.
 *
 * @param {bigint} g - The base (generator) of the group.
 * @param {bigint} h - The result of g^x mod p.
 * @param {bigint} p - The modulus (a prime number).
 * @return {bigint | null} - The exponent x, or null if no solution is found.
 */
function babyStepGiantStep(g, h, p, m) {
    const babySteps = new Map();
    let x = 1n;
    let y = h;
    let z = (0, bigint_mod_arith_1.modInv)(g, p);
    z = (0, bigint_mod_arith_1.modPow)(z, 2n, p);
    let bits = bigintLog2Floor(m);
    babySteps.set(x, 0n);
    x = x * g;
    x = x % p;
    let j = 0n;
    let giantStep, bound = 0n;
    for (let i = 0; i < bits; i++) {
        giantStep = 2n ** BigInt(i + 1);
        console.log("giantStep", giantStep);
        if (giantStep > m) {
            giantStep = m;
            z = (0, bigint_mod_arith_1.modInv)(g, p);
            z = (0, bigint_mod_arith_1.modPow)(z, m, p);
        }
        for (let k = 2n ** BigInt(i); k < giantStep; k++) {
            babySteps.set(x, k);
            x = x * g;
            x = x % p;
        }
        bound = 2n ** BigInt(2 * (i + 1));
        while (j < bound) {
            if (babySteps.has(y)) {
                const e = babySteps.get(y);
                return j + e;
            }
            y = y * z;
            y = y % p;
            j = j + giantStep;
        }
        z = z * z;
        z = z % p;
    }
    return null;
}
describe("DDH scheme", function () {
    async function deploy(aclName) {
        const DDH = await hardhat_1.ethers.getContractFactory("DDH");
        const ddh = await DDH.deploy(1, 2 ** 10);
        await ddh.waitForDeployment();
        return { ddh, ddhAddress: await ddh.getAddress() };
    }
    it("Should equal dot product", async function () {
        const { ddh } = await deploy();
        await (await ddh.generateMasterKeys()).wait();
        const masterPubKey = await ddh.getMasterPubKey.staticCallResult(0);
        console.log(masterPubKey);
        const xs = [2];
        const ys = [1];
        await (await ddh.deriveKey(0, ys)).wait();
        await (await ddh.encrypt(0, xs)).wait();
        const [cipher] = await ddh.getEncrypedText.staticCallResult(0);
        const [fKey] = await ddh.getFunctionKey.staticCallResult(0);
        const P = 303951732001538966662735198097427004967n;
        const G = 139782000973099010998056607764611120709n;
        let num = 1n;
        for (let i = 1; i < cipher.length; i++) {
            const t1 = (0, bigint_mod_arith_1.modPow)(cipher[i], BigInt(ys[i - 1]), P);
            num = (num * t1) % P;
        }
        const denom = (0, bigint_mod_arith_1.modPow)(cipher[0], fKey, P);
        const denomInv = (0, bigint_mod_arith_1.modInv)(denom, P);
        const r = (num * denomInv) % P;
        console.log("R", r);
        console.log("num", num);
        const bound = 1n * (2n ** 10n) ** 2n;
        const bb = sqrt(bound) + 1n;
        console.log("bb", bb);
        const result = babyStepGiantStep(G, r, P, bb);
        console.log("result", result);
        // const invR = modInv(G, P);
        // const result = babyStepGiantStep(G, invR, P, 3n * (2n ** 3n) ** 2n);
        if (result === null) {
            throw new Error("Failed to find the discrete logarithm within bound");
        }
        await (await ddh.decrypt(0, result)).wait();
        (0, chai_1.expect)(result).to.equal(dot(xs, ys));
    });
});
//# sourceMappingURL=scheme.js.map