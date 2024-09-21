// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Math} from "./lib/Math.sol";
import "hardhat/console.sol";
import "@oasisprotocol/sapphire-contracts/contracts/Sapphire.sol";

contract DDH {
    address private constant RANDOM_BYTES = 0x0100000000000000000000000000000000000001;

    using Math for uint256;

    uint256 public currentRefId;

    struct FunctionRef {
        uint256[] masterSecKey;
        uint256[] masterPubKey;
        uint256[] cipherText;
        uint256[] y;
        uint256 fKey;
    }

    mapping(uint256 => FunctionRef) private functionRefs;

    // Define the DDH Params (These will be immutable or constants for this contract)
    struct DDHParams {
        uint256 L; // Length of input vectors
        uint256 bound; // Bound for x and y coordinates
        uint256 G; // Generator
        uint256 P; // Modulus
        uint256 Q; // Order of G
    }

    DDHParams private params;

    uint256 private salt;

    constructor(uint256 _L, uint256 _bound) {
        uint256 _G;
        uint256 _P;
        uint256 _Q;

        // precomputed value (modulus length = 256 for solidity compatible)
        _G = 139782000973099010998056607764611120709;
        _P = 303951732001538966662735198097427004967;

        _Q = _P - 1;
        _Q /= 2;

        require(2 * _L * _bound ** 2 < _Q, "Invalid input: 2 * L * bound^2 should be less than group order.");
        params = DDHParams({L: _L, bound: _bound, G: _G, P: _P, Q: _Q});
    }

    function getMasterPubKey(uint256 refId) external view returns (uint256[] memory) {
        return functionRefs[refId].masterPubKey;
    }

    function getEncrypedText(uint256 refId) external view returns (uint256[] memory) {
        return functionRefs[refId].cipherText;
    }

    function getFunctionKey(uint256 refId) external view returns (uint256) {
        return functionRefs[refId].fKey;
    }

    // Generates the Master Secret Key (x_i) and Master Public Key (g^x_i)
    function generateMasterKeys() external returns (uint256[] memory) {
        uint256[] memory masterPubKey = new uint256[](params.L);
        FunctionRef storage ref = functionRefs[currentRefId++];

        for (uint256 i = 0; i < params.L; i++) {
            uint256 x = sample(2, params.Q);
            ref.masterSecKey.push(x);
            uint256 y = Math.modExp(params.G, x, params.P);
            ref.masterPubKey.push(y);
            masterPubKey[i] = y;
        }

        return masterPubKey;
    }

    // Derives the functional encryption key
    function deriveKey(uint256 refId, uint256[] memory y) public returns (uint256) {
        require(refId < currentRefId, "Invalid refId");
        require(y.length == params.L, "Invalid input length");
        FunctionRef storage ref = functionRefs[refId];
        require(ref.y.length == 0, "Function already declared");
        // TODO: check bound of y here too

        uint256 key = 0;
        for (uint256 i = 0; i < params.L; i++) {
            key += ref.masterSecKey[i] * y[i];
            ref.y.push(y[i]);
        }

        ref.fKey = key;

        return key % params.Q;
    }

    // Encrypts vector x with the master public key
    function encrypt(uint256 refId, int256[] memory x) public returns (uint256[] memory) {
        require(refId < currentRefId, "Invalid refId");
        require(x.length == params.L, "Invalid input length");
        FunctionRef storage ref = functionRefs[refId];
        require(ref.masterPubKey.length != 0, "Invalid master public key");
        require(ref.cipherText.length == 0, "Function already declared");

        uint256 r = sample(2, params.Q);
        uint256[] memory ciphertext = new uint256[](params.L + 1);

        // ct0 = g^r
        // ciphertext[0] = Math.modExp(params.G, r, params.P);
        ref.cipherText.push(Math.modExp(params.G, r, params.P));

        for (uint256 i = 0; i < params.L; i++) {
            // ct_i = h_i^r * g^x_i
            // ct_i = mpk[i]^r * g^x_i
            uint256 t1 = Math.modExp(ref.masterPubKey[i], r, params.P);
            uint256 t2 = Math.modExpEx(params.G, x[i], params.P);
            ref.cipherText.push((t1 * t2) % params.P);
        }

        return ciphertext;
    }

    // Decrypts the ciphertext and retrieves the inner product
    function decrypt(uint256 refId, uint256 providedXY) public returns (uint256) {
        require(refId < currentRefId, "Invalid refId");

        FunctionRef storage ref = functionRefs[refId];

        require(ref.cipherText.length == params.L + 1, "Invalid ciphertext length");
        require(ref.y.length == params.L, "Invalid ciphertext length");

        uint256 num = 1;
        for (uint256 i = 1; i < ref.cipherText.length; i++) {
            // not allow y to be -bound
            uint256 t1 = Math.modExp(ref.cipherText[i], ref.y[i - 1], params.P);
            num = (num * t1) % params.P;
        }

        uint256 denom = Math.modExp(ref.cipherText[0], ref.fKey, params.P);
        uint256 denomInv = Math.invMod(denom, params.P);
        uint256 r = num * denomInv % params.P;
        // uint256 bound = params.L * (params.bound ** 2);

        require(verify(r, params.G, params.P, providedXY), "Invalid verification");
        return providedXY;
    }

    function sample(uint256 from, uint256 to) internal returns (uint256) {
        uint256 rand = generateNumber();

        return rand % (to - from) + from;
    }

    function verify(uint256 h, uint256 g, uint256 p, uint256 xy) internal view returns (bool) {
        return Math.modExp(g, xy, p) == h;
    }

    // do some weird stuff here to make it work both testnet and prod realquick
    function generateNumber() public returns (uint256) {
        return uint256(
            keccak256(
                abi.encodePacked(++salt, block.timestamp, bytes32(Sapphire.randomBytes(32, abi.encodePacked(salt))))
            )
        );
    }
}
