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
import { useDecryption, useInformation, useMultiEncryption } from "@/hook";

enum STATUS {
  REVIEW,
  SELECT_FUNCTION,
  FINISH,
}

export function LoadedInformation() {
  const [state, setState] = useState(STATUS.REVIEW);
  const [option, setOption] = useState("");
  const { name, verificationResult, attestable } = useInformation();

  const { writeTxInfo: decrypTxInfo, doWrite: doDecryption } = useDecryption();
  const {
    writeTxInfo: multiWriteTxInfo,
    writeTxError,
    doWrite: doMultiEncryption,
  } = useMultiEncryption();

  const onSubmit = () => {
    console.log("onSubmit");
    doMultiEncryption();
  };
  const onAttestation = () => {
    console.log("onAttestation");
    doDecryption();
  };

  useEffect(() => {
    if (decrypTxInfo) {
      setState(STATUS.FINISH);
    }
  }, [decrypTxInfo?.status, multiWriteTxInfo?.status]);

  useEffect(() => {
    if (multiWriteTxInfo) {
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
            if (attestable) {
              onAttestation();
              return;
            }
            if (state === STATUS.REVIEW) {
              setState(STATUS.SELECT_FUNCTION);
            } else if (state === STATUS.SELECT_FUNCTION) {
              onSubmit();
              // setState(STATUS.FINISH);
            }
          }}
        >
          {state === STATUS.REVIEW && !attestable ? "Next" : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
