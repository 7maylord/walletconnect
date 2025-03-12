import { useEffect,useState } from "react";
import "./App.css";
import WalletConnect from "./component/WalletConnect";
import ChainSwitch from "./component/ChainSwitch";
import TransactionForm from "./component/TransactionForm";
import { useEthereumProvider } from "./hooks/useEthereumProvider";
import { networkInfoMap } from "./config";

const App = () => {
  const {
    connectWallet,
    disconnectWallet,
    walletAddress,
    currentChain,
    error,
    isConnecting,
    balance,
    switchNetwork,
    sendTransaction,
    setupProviderListeners,
    removeProviderListeners
  } = useEthereumProvider();

  const [localError, setLocalError] = useState<string | null>(null);
  
  useEffect(() => {
    setupProviderListeners();
    return () => {
      removeProviderListeners();
    };
  }, [setupProviderListeners, removeProviderListeners]);

    // Effect to clear the error after 5 seconds
    useEffect(() => {
      if (error) {
        setLocalError(error);
        const timer = setTimeout(() => {
          setLocalError(null);
        }, 5000); 
  
        return () => clearTimeout(timer); 
      }
    }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">EIP-1193 Wallet Connector</h1>
        <div className="flex flex-col md:flex-row">
          <WalletConnect 
            walletAddress={walletAddress}
            balance={balance}
            isConnecting={isConnecting}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
          />
          
          <main className="flex-1 p-4 bg-gray-700 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Wallet Dashboard</h2>
            {walletAddress ? (
              <>
                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <h3 className="text-lg font-semibold">Network Information</h3>
                  <p className="text-gray-400">
                    Connected to: {currentChain && networkInfoMap[currentChain]?.chainName || `Unknown Chain (${currentChain})`}
                  </p>
                </div>
                
                <ChainSwitch 
                  currentChain={currentChain} 
                  switchNetwork={switchNetwork} 
                />
                
                <TransactionForm sendTransaction={sendTransaction} />
              </>
            ) : (
              <div className="bg-gray-800 p-6 rounded-lg text-center">
                <p className="text-gray-400 mb-4">No wallet connected</p>
                <p className="text-sm text-gray-500">Connect your wallet to access the dashboard features</p>
              </div>
            )}
          </main>
        </div>
        
        {localError && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-400 text-center">{localError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;




