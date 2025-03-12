import React from 'react';

interface WalletConnectProps {
  walletAddress: string | null;
  balance: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  walletAddress,
  balance,
  isConnecting,
  connectWallet,
  disconnectWallet
}) => {
  return (
    <aside className="w-full md:w-1/3 bg-gray-700 p-4 rounded-lg md:mr-4 mb-4 md:mb-0">
      <h2 className="text-xl font-semibold mb-4">Wallet</h2>
      <button
        onClick={walletAddress ? disconnectWallet : connectWallet}
        disabled={isConnecting}
        className={`w-full p-3 border rounded-lg transition ${
          isConnecting 
            ? "bg-gray-600 cursor-not-allowed" 
            : walletAddress 
              ? "bg-red-600 hover:bg-red-500" 
              : "bg-blue-600 hover:bg-blue-500"
        }`}
      >
        {isConnecting 
          ? "Connecting..." 
          : walletAddress 
            ? "Disconnect Wallet" 
            : "Connect Wallet"
        }
      </button>
      
      {walletAddress && (
        <div className="mt-4 bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Connected Account</p>
          <p className="text-sm font-mono break-all">{walletAddress}</p>
          
          {balance && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <p className="text-lg font-semibold">{balance} ETH</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default WalletConnect;
