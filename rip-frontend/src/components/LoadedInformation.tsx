import { useState } from "react";
import { Button } from "@/components/ui/button";
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

enum STATUS {
  REVIEW,
  SELECT_FUNCTION,
  FINISH,
}

const useEncryption = () => {
  const contractAddress = "";
  const account = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: sapphireTestnet.id,
  });
  const [writeTxHash, setWriteTxHash] = useState<undefined | `0x${string}`>();
  // const [readResult, setReadResult] = useState<bigint | undefined>();
  const publicClient = usePublicClient()!;

  const { data: writeReceipt, error: writeTxError } =
    useWaitForTransactionReceipt({ hash: writeTxHash, confirmations: 1 });

  const { data: writeTxInfo } = useTransaction({
    hash: writeReceipt?.transactionHash,
  });

  async function doWrite() {
    if (contractAddress) {
      const callArgs = {
        account: account.address!,
        abi: DDHMultiABI,
        address: contractAddress,
        functionName: "multiEncrypt",
        args: [
          0n,
          [
            [1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n],
            [2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n],
          ],
        ],
      } as const;
      const result = await walletClient!.writeContract({
        ...callArgs,
        chain: sapphireTestnet,
        gas: await publicClient.estimateContractGas(callArgs),
      });
      setWriteTxHash(result);
    }
  }
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

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>
          {state === STATUS.REVIEW ? "Review" : "Select Function"}
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
              // doWrite;
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
