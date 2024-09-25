import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";
import { LoadedInformation } from "@/components/LoadedInformation";

function DApp() {
  const account = useAccount();
  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <>
      <LoadedInformation />;
      <div className="absolute right-0 top-0">
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
