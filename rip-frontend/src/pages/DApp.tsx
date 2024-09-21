import { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  usePublicClient,
  useTransaction,
  useWaitForTransactionReceipt,
  useWalletClient,
} from "wagmi";
import { sapphireTestnet } from "wagmi/chains";
import { Button } from "@/components/ui/button";
import { LoadedInformation } from "@/components/LoadedInformation";
import { DDHMultiABI } from "@/constant/abi";

function DApp() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: walletClient } = useWalletClient({
    chainId: sapphireTestnet.id,
  });
  const [contractAddress, setContractAddress] = useState<
    undefined | `0x${string}`
  >();
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

  async function doRead() {
    if (contractAddress) {
      const result = await publicClient.readContract({
        abi: DDHMultiABI,
        address: contractAddress,
        functionName: "getAllEncryptedText",
        args: [0n],
      });
      console.log({ result });
    }
  }

  return <LoadedInformation />;

  return (
    <>
      <div>
        <h2>Account</h2>

        <div>
          status: {account.status}
          <br />
          {account.addresses && (
            <>
              address: <span id="accountAddress">{account.addresses[0]}</span>
            </>
          )}
          <br />
          chainId: {account.chainId}
          {account.chain && <span>&nbsp;({account.chain?.name})</span>}
        </div>
        <hr />

        {account.status === "connected" && (
          <button type="button" onClick={() => disconnect()}>
            Disconnect
          </button>
        )}
      </div>

      <div>
        <h2>Connect wallet</h2>
        {connectors.map((connector) => (
          <Button
            key={connector.uid}
            onClick={() => connect({ connector })}
            type="button"
            id={"connect-" + connector.id}
          >
            {connector.name}
          </Button>
        ))}
        <div>{status}</div>
        <div>{error?.message}</div>
      </div>
    </>
  );
}

export default DApp;
