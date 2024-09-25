import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
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

  const {
    writeTxInfo: decrypTxInfo,
    doWrite: doDecryption,
    isLoading: isDecryptionLoading,
    isSuccess: isDecryptionSuccess,
  } = useDecryption();
  const {
    writeTxInfo: multiWriteTxInfo,
    writeTxError,
    doWrite: doMultiEncryption,
    isSuccess: isEncryptionSuccess,
    isLoading: isEncryptionLoading,
  } = useMultiEncryption();

  const isPending = isDecryptionLoading || isEncryptionLoading;

  console.log({ isDecryptionSuccess, isEncryptionSuccess });

  const onSubmit = () => {
    console.log("onSubmit");
    alert("Generating function key for matching DNA might take a while 😴");
    doMultiEncryption();
  };
  const onAttestation = () => {
    console.log("onAttestation");
    alert(
      "Submitting your encrypted DNA and running matching DNA algorithm might take a while 😴"
    );
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

  useEffect(() => {
    if (isDecryptionSuccess) {
      alert("Congratulations! John's will is now fullfilled 🎉");
      navigate("/");
    }
  }, [isDecryptionSuccess]);

  useEffect(() => {
    if (isEncryptionSuccess) {
      alert("Successfully publish your encrypted DNA 🎉");
      navigate("/");
    }
  }, [isEncryptionSuccess]);

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
          {state === STATUS.SELECT_FUNCTION &&
            "What's your will criteria? (your data won't be use for other purpose)"}
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
                  <SelectItem value="0">
                    Inner Product (DNA Similarity){" "}
                  </SelectItem>
                  <SelectItem value="1">
                    Kinssip coefficient (Common genetic inheritance pattern){" "}
                  </SelectItem>
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
                navigate("/");
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
          {isPending
            ? "Loading"
            : state === STATUS.REVIEW && !attestable
            ? "Next"
            : "Submit"}
        </Button>
      </CardFooter>
    </Card>
  );
}
