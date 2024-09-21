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
import type { Abi } from "abitype";
import { sapphireTestnet } from "wagmi/chains";
import { Button } from "@/components/ui/button";

/*
// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.2 <0.9.0;
contract Storage {
    uint256 number;
    function store(uint256 num) public {
        number = num;
    }
    function retrieve() public view returns (uint256){
        return number;
    }
}
*/
const StorageBytecode =
  "0x608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80632e64cec1146100385780636057361d14610056575b5f80fd5b610040610072565b60405161004d919061009b565b60405180910390f35b610070600480360381019061006b91906100e2565b61007a565b005b5f8054905090565b805f8190555050565b5f819050919050565b61009581610083565b82525050565b5f6020820190506100ae5f83018461008c565b92915050565b5f80fd5b6100c181610083565b81146100cb575f80fd5b50565b5f813590506100dc816100b8565b92915050565b5f602082840312156100f7576100f66100b4565b5b5f610104848285016100ce565b9150509291505056fea26469706673582212201bc715d5ea5b4244a667a55f9fd36929a52a02208d9b458fdf543f5495011b2164736f6c63430008180033";

const StorageABI = [
  {
    inputs: [],
    name: "retrieve",
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
        name: "num",
        type: "uint256",
      },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const satisfies Abi;

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
  const [readResult, setReadResult] = useState<bigint | undefined>();
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
        abi: StorageABI,
        address: contractAddress,
        functionName: "store",
        args: [BigInt(Math.round(Math.random() * 100000))],
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
        abi: StorageABI,
        address: contractAddress,
        functionName: "retrieve",
        args: [],
      });
      setReadResult(result);
    }
  }

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
