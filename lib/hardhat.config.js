"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("@oasisprotocol/sapphire-hardhat");
require("@nomicfoundation/hardhat-ethers");
require("@typechain/hardhat");
require("@nomicfoundation/hardhat-chai-matchers");
const config = {
    solidity: "0.8.20",
    networks: {
        "sapphire-testnet": {
            // This is Testnet! If you want Mainnet, add a new network config item.
            url: "https://testnet.sapphire.oasis.io",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: 0x5aff,
        },
    },
};
exports.default = config;
//# sourceMappingURL=hardhat.config.js.map