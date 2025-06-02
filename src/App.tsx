import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useState } from "react";

const RECIPIENT_ADDRESS = import.meta.env.VITE_APP_RECIPIENT_ADDRESS;
const NETWORK = import.meta.env.VITE_APP_NETWORK;

function App() {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [digest, setDigest] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTransfer = () => {
    setLoading(true);
    const transaction = new Transaction();
    const amountInMist = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));
    transaction.transferObjects(
      [transaction.splitCoins(transaction.gas, [amountInMist])],
      RECIPIENT_ADDRESS
    );

    signAndExecuteTransaction(
      {
        transaction,
        chain: `sui:${NETWORK}`,
      },
      {
        onSuccess: (result) => {
          console.log("Transfer successful:", result);
          setDigest(result.digest);
          setAmount("");
          setError("");
          setLoading(false);
        },
        onError: (error) => {
          console.error("Transfer failed:", error);
          setError("Error in transaction");
          setLoading(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <ConnectButton />
      {!account && <div className="my-2">No account connected</div>}
      {account && (
        <div className="space-y-4 mt-3 px-3">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Connected account:
            </span>
            <div className="p-3 bg-gray-100 rounded border text-sm text-gray-600 break-all">
              {account.address}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Recipient:
            </span>
            <div className="p-3 bg-gray-100 rounded border text-sm text-gray-600 break-all">
              {RECIPIENT_ADDRESS}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SUI)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in SUI"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          <button
            onClick={handleTransfer}
            disabled={!amount || loading}
            className="w-full p-3 rounded font-medium transition-colors bg-blue-500 text-white cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Transferring..." : "Transfer SUI"}
          </button>
          {digest && (
            <div className="mt-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Digest
              </label>
              <div className="p-3 bg-green-100 rounded">
                <p className="text-sm text-green-800 break-all">{digest}</p>
                <a
                  href={`https://suiexplorer.com/txblock/${digest}?network=${NETWORK}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-800 text-sm underline mt-2 inline-block"
                >
                  View on Sui Explorer
                </a>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Error
              </label>
              <div className="p-3 bg-red-100 rounded">
                <p className="text-sm text-red-800 break-all">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
