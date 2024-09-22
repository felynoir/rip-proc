import { useEffect, useMemo, useState } from "react";

import {
  useAccount,
  usePublicClient,
  useTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { sapphireTestnet } from "viem/chains";
import { DDHMultiABI } from "@/constant/abi";
import { modInv, modPow } from "bigint-mod-arith";
import { babyStepGiantStep, sqrt } from "@/lib/math";
import { useQuery } from "@tanstack/react-query";

// precompile constants
const P = 303951732001538966662735198097427004967n;
const G = 139782000973099010998056607764611120709n;

const x1 = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n]; // this should be kept as a secret
const x2 = [2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n]; // this too.
const ys = [
  [3n, 5n, 5n, 10n, 1n, 2n, 3n, 4n, 5n, 6n],
  [4n, 6n, 2n, 3n, 6n, 11n, 7n, 8n, 9n, 10n],
];
export const ddhm = "0x6ecbD564E77BFbb88e6e28Cd64DF0a334efd990e";

export const useMultiEncryption = () => {
  const account = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: sapphireTestnet.id,
  });
  const [writeTxHash, setWriteTxHash] = useState<undefined | `0x${string}`>();
  const publicClient = usePublicClient()!;

  const { data: writeReceipt, error: writeTxError } =
    useWaitForTransactionReceipt({ hash: writeTxHash, confirmations: 1 });

  const { data: writeTxInfo } = useTransaction({
    hash: writeReceipt?.transactionHash,
  });

  async function doWrite() {
    if (!account.address) return;
    if (ddhm) {
      const callArgs = {
        account: account.address!,
        abi: DDHMultiABI,
        address: ddhm,
        functionName: "multiEncrypt",
        args: [0n, [x1, x2]],
      } as const;
      const result = await walletClient!.writeContract({
        ...callArgs,
        chain: sapphireTestnet,
        gas: await publicClient.estimateContractGas(callArgs),
      });
      setWriteTxHash(result);
    }
  }

  return { writeTxInfo, doWrite, writeTxError };
};

export const useDecryption = (initialRefId = 0n) => {
  const [refId, setRefId] = useState(initialRefId);
  const account = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: sapphireTestnet.id,
  });
  const [writeTxHash, setWriteTxHash] = useState<undefined | `0x${string}`>();
  const publicClient = usePublicClient()!;

  const { data: writeReceipt, error: writeTxError } =
    useWaitForTransactionReceipt({ hash: writeTxHash, confirmations: 1 });

  const { data: writeTxInfo } = useTransaction({
    hash: writeReceipt?.transactionHash,
  });

  const { data: ciphers } = useQuery({
    queryKey: ["ciphers", refId.toString()],
    queryFn: async () => {
      const result = await publicClient.readContract({
        abi: DDHMultiABI,
        address: ddhm,
        functionName: "getAllEncryptedText",
        args: [refId],
      });
      return result;
    },
  });

  const { data: fKeys } = useQuery({
    queryKey: ["fKeys", refId.toString()],
    queryFn: async () => {
      const result = await publicClient.readContract({
        abi: DDHMultiABI,
        address: ddhm,
        functionName: "getAllFunctionKeys",
        args: [refId],
      });
      return result;
    },
  });

  const precalculatedResult = useMemo(() => {
    if (!ciphers || !fKeys) return;
    if (ciphers.length > 0) return;
    if (fKeys.length > 0) return;
    let results: bigint[] = [];

    for (let slot = 0; slot < 2; slot++) {
      let num = 1n;
      for (let i = 1; i < ciphers[slot].length; i++) {
        const t1 = modPow(ciphers[slot][i], ys[slot][i - 1], P);
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
    return results;
  }, [ciphers, fKeys]);

  async function doWrite() {
    if (!account.address) return;
    if (ddhm) {
      const callArgs = {
        account: account.address!,
        abi: DDHMultiABI,
        address: ddhm,
        functionName: "multiDecrypt",
        args: [refId, precalculatedResult],
      } as const;
      const result = await walletClient!.writeContract({
        ...callArgs,
        chain: sapphireTestnet,
        gas: await publicClient.estimateContractGas(callArgs),
      });
      setWriteTxHash(result);
    }
  }

  return { writeTxInfo, doWrite, writeTxError, setRefId, ciphers, fKeys };
};

export const useInformation = () => {
  const { ciphers, fKeys } = useDecryption();
  const attestable = ciphers && fKeys && ciphers.length > 0 && fKeys.length > 0;

  const [verificationResult, setVerificationResult] = useState("Verified");

  return {
    name: attestable ? "Dolly Doe" : "John Doe",
    verificationResult,
    attestable,
  };
};
