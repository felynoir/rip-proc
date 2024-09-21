"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
const dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);
describe("DDH scheme", function () {
    async function deploy(aclName) {
        const DDH = await hardhat_1.ethers.getContractFactory("DDH");
        const ddh = await DDH.deploy(3, 2 ** 3);
        await ddh.waitForDeployment();
        return { ddh, ddhAddress: await ddh.getAddress() };
    }
    it("Should equal dot product", async function () {
        const { ddh } = await deploy();
        await (await ddh.generateMasterKeys()).wait();
        const res = await ddh.generateMasterKeys.staticCallResult();
        console.log(res);
        const xs = [5, 6, 9];
        const ys = [114, 23, 19];
        const fKey = await ddh.deriveKey(0, ys);
        // const cipher = await ddh.encrypt(xs, [...masterPubKey]);
        // const xy = await ddh.decrypt([...cipher], fKey, ys);
        // expect(xy).to.equal(dot(xs, ys));
    });
});
//# sourceMappingURL=DDH.js.map