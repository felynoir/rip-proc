"use strict";
// Usage: pnpm hardhat run --network <network> scripts/run-vigil.ts
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const Vigil = await hardhat_1.ethers.getContractFactory("Vigil");
    const vigil = await Vigil.deploy();
    console.log("Vigil deployed to:", await vigil.getAddress());
    const tx = await vigil.createSecret("ingredient", 30 /* seconds */, Buffer.from("brussels sprouts"));
    console.log("Storing a secret in", tx.hash);
    await tx.wait();
    try {
        console.log("Checking the secret");
        await vigil.connect(hardhat_1.ethers.provider).revealSecret.staticCall(0);
        console.log("Uh oh. The secret was available!");
        process.exit(1);
    }
    catch (e) {
        console.log("failed to fetch secret:", e.message);
    }
    console.log("Waiting...");
    // Manually generate some transactions to increment local Docker
    // container block
    if ((await hardhat_1.ethers.provider.getNetwork()).name == "sapphire_localnet") {
        await generateTraffic(10);
    }
    await new Promise((resolve) => setTimeout(resolve, 30_000));
    console.log("Checking the secret again");
    await (await vigil.revealSecret(0)).wait(); // Reveal the secret.
    const secret = await vigil.revealSecret.staticCallResult(0); // Get the value.
    console.log("The secret ingredient is", Buffer.from(secret[0].slice(2), "hex").toString());
}
async function generateTraffic(n) {
    const signer = await hardhat_1.ethers.provider.getSigner();
    for (let i = 0; i < n; i++) {
        await signer.sendTransaction({
            to: "0x000000000000000000000000000000000000dEaD",
            value: hardhat_1.ethers.parseEther("1.0"),
            data: "0x",
        });
    }
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=run-vigil.js.map