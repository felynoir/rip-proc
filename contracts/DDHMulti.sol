// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./DDH.sol";

contract DDHMulti is DDH {
    uint256 public slots;

    struct MultiFunctionRef {
        FunctionRef[] refs;
        uint256[][] otpKeys;
    }

    mapping(uint256 => MultiFunctionRef) private multiFunctionRefs;

    constructor(uint256 _slots, uint256 _L, uint256 _bound) DDH(_L, _bound) {
        slots = _slots;
    }

    function getAllEncryptedText(uint256 refId) external view returns (uint256[][] memory) {
        uint256[][] memory ciphers = new uint256[][](slots);

        for (uint256 s = 0; s < slots; s++) {
            ciphers[s] = multiFunctionRefs[refId].refs[s].cipherText;
        }

        return ciphers;
    }

    function getAllFunctionKeys(uint256 refId) external view returns (uint256[] memory) {
        uint256[] memory fKeys = new uint256[](slots);

        for (uint256 s = 0; s < slots; s++) {
            fKeys[s] = multiFunctionRefs[refId].refs[s].fKey;
        }

        return fKeys;
    }

    function generateMultiMasterKeys() external returns (uint256[][] memory) {
        uint256[][] memory multiMasterPubKey = new uint256[][](slots);
        MultiFunctionRef storage multiRef = multiFunctionRefs[currentRefId++];

        for (uint256 s = 0; s < slots; s++) {
            uint256[] memory masterPubKey = new uint256[](params.L);
            FunctionRef storage ref = multiRef.refs.push();

            for (uint256 i = 0; i < params.L; i++) {
                uint256 x = sample(2, params.Q);
                ref.masterSecKey.push(x);
                uint256 y = Math.modExp(params.G, x, params.P);
                ref.masterPubKey.push(y);
                masterPubKey[i] = y;
            }

            multiMasterPubKey[s] = masterPubKey;

            // Generate OTP keys
            uint256[] storage otpKeys = multiRef.otpKeys.push();
            for (uint256 i = 0; i < params.L; i++) {
                otpKeys.push(sample(0, 1));
            }
        }

        return multiMasterPubKey;
    }

    function deriveMultiKey(uint256 refId, uint256[][] memory y) public returns (uint256[] memory, uint256) {
        require(refId < currentRefId, "Invalid refId");
        require(y.length == slots, "Invalid number of slots");

        MultiFunctionRef storage multiRef = multiFunctionRefs[refId];
        require(multiRef.refs.length == slots, "Invalid multiRef");

        uint256[] memory keys = new uint256[](slots);
        uint256 otpKey = 0;

        for (uint256 s = 0; s < slots; s++) {
            require(y[s].length == params.L, "Invalid input length");
            FunctionRef storage ref = multiRef.refs[s];
            require(ref.y.length == 0, "Function already declared");

            uint256 key = 0;
            for (uint256 i = 0; i < params.L; i++) {
                key += ref.masterSecKey[i] * y[s][i];
                ref.y.push(y[s][i]);
                otpKey += multiRef.otpKeys[s][i] * y[s][i];
            }

            ref.fKey = key;
            keys[s] = key % params.Q;
        }

        otpKey = otpKey % params.bound;

        return (keys, otpKey);
    }

    // for ease of use we will just do multi encrypt here instead separate but the logic will be the same
    function multiEncrypt(uint256 refId, int256[][] memory x) public returns (uint256[][] memory) {
        require(refId < currentRefId, "Invalid refId");
        require(x.length == slots, "Invalid number of slots");

        MultiFunctionRef storage multiRef = multiFunctionRefs[refId];
        require(multiRef.refs.length == slots, "Invalid multiRef");

        uint256[][] memory multiCiphertext = new uint256[][](slots);

        for (uint256 s = 0; s < slots; s++) {
            require(x[s].length == params.L, "Invalid input length");
            FunctionRef storage ref = multiRef.refs[s];
            require(ref.masterPubKey.length != 0, "Invalid master public key");
            require(ref.cipherText.length == 0, "Function already declared");

            uint256 r = sample(2, params.Q);
            // uint256[] memory ciphertext = new uint256[](params.L + 1);

            ref.cipherText.push(Math.modExp(params.G, r, params.P));

            for (uint256 i = 0; i < params.L; i++) {
                uint256 t1 = Math.modExp(ref.masterPubKey[i], r, params.P);
                uint256 t2 = Math.modExpEx(params.G, x[s][i] + int256(multiRef.otpKeys[s][i]), params.P);
                ref.cipherText.push((t1 * t2) % params.P);
            }

            multiCiphertext[s] = ref.cipherText;
        }

        return multiCiphertext;
    }

    function multiDecrypt(uint256 refId, uint256[] memory providedXY) public returns (uint256) {
        require(refId < currentRefId, "Invalid refId");
        require(providedXY.length == slots, "Invalid number of slots");

        MultiFunctionRef storage multiRef = multiFunctionRefs[refId];
        require(multiRef.refs.length == slots, "Invalid multiRef");

        uint256 result = 0;

        for (uint256 s = 0; s < slots; s++) {
            FunctionRef storage ref = multiRef.refs[s];

            require(ref.cipherText.length == params.L + 1, "Invalid ciphertext length");
            require(ref.y.length == params.L, "Invalid y length");

            uint256 num = 1;
            for (uint256 i = 1; i < ref.cipherText.length; i++) {
                uint256 t1 = Math.modExp(ref.cipherText[i], ref.y[i - 1], params.P);
                num = (num * t1) % params.P;
            }

            uint256 denom = Math.modExp(ref.cipherText[0], ref.fKey, params.P);
            uint256 denomInv = Math.invMod(denom, params.P);
            uint256 r = num * denomInv % params.P;

            require(verify(r, params.G, params.P, providedXY[s]), "Invalid verification");
            result += providedXY[s];
        }

        return result;
    }
}
