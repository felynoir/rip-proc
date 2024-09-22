import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHref, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  useAccount,
  useConnect,
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
import { RpcRequestError } from "viem";

enum STATUS {
  REVIEW,
  SELECT_FUNCTION,
  FINISH,
}

// precompile constants
const P = 303951732001538966662735198097427004967n;
const G = 139782000973099010998056607764611120709n;

const x1 = [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n]; // this should be kept as a secret
const x2 = [2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n]; // this too.
const ys = [
  [3n, 5n, 5n, 10n, 1n, 2n, 3n, 4n, 5n, 6n],
  [4n, 6n, 2n, 3n, 6n, 11n, 7n, 8n, 9n, 10n],
];
export const ddhm = "0x97f4C40e9C90254246346559a270455292F0C77F";

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
    queryKey: ["ciphers", refId],
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
    queryKey: ["fKeys", refId],
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

const useInformation = () => {
  const [name, setName] = useState("John Doe");
  const [dna, setDna] = useState([9n, 10n, 11n, 12n, 13n, 14n, 1n, 2n, 3n, 4n]);
  const [verificationResult, setVerificationResult] = useState("Verified");

  return {
    name,
    dna,
    verificationResult,
  };
};

export function LoadedInformation() {
  const [state, setState] = useState(STATUS.REVIEW);
  const [option, setOption] = useState("");
  const { name, dna, verificationResult } = useInformation();

  // const { writeTxInfo, doWrite, writeTxError, setRefId } = useDecryption();
  const {
    writeTxInfo: multiWriteTxInfo,
    writeTxError,
    doWrite: doMultiEncryption,
  } = useMultiEncryption();

  const onSubmit = () => {
    console.log("onSubmit");
    doMultiEncryption();
  };

  console.log("multiWriteTxInfo", multiWriteTxInfo);
  useEffect(() => {
    if (multiWriteTxInfo?.status === "success") {
      setState(STATUS.FINISH);
    }
  }, [multiWriteTxInfo?.status]);

  const navigate = useNavigate();

  if (writeTxError) {
    console.error(writeTxError);
    alert("Fail to register your DNA 😭");
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>
          {state === STATUS.REVIEW && "Review"}
          {state === STATUS.SELECT_FUNCTION && "Select Function"}
          {state === STATUS.FINISH &&
            "Condition Matched 🎉 Submission Completed"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {state === STATUS.REVIEW && (
          <>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder={name} disabled />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="framework">DNA</Label>
                  <span className="text-muted-foreground">
                    {verificationResult}
                  </span>
                </div>
              </div>
            </form>
          </>
        )}
        {state === STATUS.SELECT_FUNCTION && (
          <>
            <form>
              <Select onValueChange={(val) => setOption(val)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="0">Compare Similarity of DNA</SelectItem>
                  {/* <SelectItem value="none">None</SelectItem> */}
                </SelectContent>
              </Select>
            </form>
          </>
        )}

        {state === STATUS.FINISH && (
          <div>
            <Button
              variant="outline"
              onClick={() => {
                navigate("/dashboard");
              }}
            >
              Back
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {state === STATUS.REVIEW && <Button variant="outline">Back</Button>}
        {state === STATUS.SELECT_FUNCTION && (
          <Button variant="outline" onClick={() => setState(STATUS.REVIEW)}>
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (state === STATUS.REVIEW) {
              setState(STATUS.SELECT_FUNCTION);
            } else if (state === STATUS.SELECT_FUNCTION) {
              onSubmit();
              // setState(STATUS.FINISH);
            }
          }}
        >
          {state === STATUS.REVIEW ? "Next" : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
