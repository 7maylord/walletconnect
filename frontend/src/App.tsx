import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import ChainSwitch from "./components/ChainSwitch";
import "./App.css";

function App() {
  const [provider, setProvider] = useState<any>(null);
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6">EIP-6963 Wallet Selector</h1>

        <div className="flex">
          {/* Sidebar: Wallet List */}
          <aside className="w-1/3 bg-gray-700 p-4 rounded-lg mr-4">
            <h2 className="text-xl font-semibold mb-4">Wallets</h2>
            <WalletConnect 
              setProvider={setProvider} 
              setCurrentChain={setCurrentChain} 
              setWalletAddress={setWalletAddress} 
            />
          </aside>

          {/* Main Section: Wallet Details & Network Selection */}
          <main className="flex-1 p-4 bg-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Wallet Dashboard</h2>

            {provider ? (
              <>
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold">Connected Wallet</h3>
                  <p className="text-gray-400">Address: {walletAddress || "Not Available"}</p>
                  <p className="text-gray-400">Chain ID: {currentChain || "Unknown"}</p>
                </div>

                {/* Chain Selection */}
                <ChainSwitch provider={provider} currentChain={currentChain} />
              </>
            ) : (
              <p className="text-gray-400">No wallet connected. Please select a wallet from the list.</p>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
