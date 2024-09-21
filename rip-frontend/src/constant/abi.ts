import { Abi } from "viem";

export const DDHMultiABI = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_slots",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_L",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_bound",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "currentRefId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "providedXY",
        type: "uint256",
      },
    ],
    name: "decrypt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "y",
        type: "uint256[]",
      },
    ],
    name: "deriveKey",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "uint256[][]",
        name: "y",
        type: "uint256[][]",
      },
    ],
    name: "deriveMultiKey",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "int256[]",
        name: "x",
        type: "int256[]",
      },
    ],
    name: "encrypt",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "generateMasterKeys",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "generateMultiMasterKeys",
    outputs: [
      {
        internalType: "uint256[][]",
        name: "",
        type: "uint256[][]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "generateNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
    ],
    name: "getAllEncryptedText",
    outputs: [
      {
        internalType: "uint256[][]",
        name: "",
        type: "uint256[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
    ],
    name: "getAllFunctionKeys",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
    ],
    name: "getEncrypedText",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
    ],
    name: "getFunctionKey",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
    ],
    name: "getMasterPubKey",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "providedXY",
        type: "uint256[]",
      },
    ],
    name: "multiDecrypt",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "refId",
        type: "uint256",
      },
      {
        internalType: "int256[][]",
        name: "x",
        type: "int256[][]",
      },
    ],
    name: "multiEncrypt",
    outputs: [
      {
        internalType: "uint256[][]",
        name: "",
        type: "uint256[][]",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "slots",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;
