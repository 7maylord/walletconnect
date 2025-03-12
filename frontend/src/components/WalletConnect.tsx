import { useEffect, useState, useCallback, useRef } from "react";
import { LOCAL_STORAGE_KEYS, EIP6963EventNames } from "../config/index";
import { truncateAddress } from "../utils/helpers";

interface WalletConnectProps {
  setProvider: React.Dispatch<any>;
  setCurrentChain: React.Dispatch<React.SetStateAction<number | null>>;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
  isInitialized: boolean;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ 
  setProvider, 
  setCurrentChain, 
  setWalletAddress,
  isInitialized 
}) => {
  const [wallets, setWallets] = useState<EIP6963ProviderDetail[]>([]);
  const providerRef = useRef<EIP1193Provider | null>(null);
  const [, setReconnectAttempted] = useState(false);

  // Handle provider announcements
  const handleProviderAnnounce = useCallback((event: any) => {
    setWallets((prev) => {
      const walletMap = new Map(prev.map((wallet) => [wallet.info.uuid, wallet]));
      if (!walletMap.has(event.detail.info.uuid)) {
        walletMap.set(event.detail.info.uuid, event.detail);
      }
      return Array.from(walletMap.values());
    });
  }, []);

  // Set up event listeners for wallet announcements
  useEffect(() => {
    window.addEventListener(EIP6963EventNames.Announce, handleProviderAnnounce as unknown as EventListener);
    window.dispatchEvent(new Event(EIP6963EventNames.Request));

    return () => {
      window.removeEventListener(EIP6963EventNames.Announce, handleProviderAnnounce as unknown as EventListener);
    };
  }, [handleProviderAnnounce]);

  // Attempt to reconnect with previously used wallet
  useEffect(() => {
    const reconnectToPreviousWallet = async () => {
      if (!isInitialized) return;
      
      const prevProviderRDNS = localStorage.getItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
      if (!prevProviderRDNS || wallets.length === 0) return;

      // Find the previously connected wallet
      const matchingWallet = wallets.find(wallet => wallet.info.rdns === prevProviderRDNS);
      if (matchingWallet) {
        try {
          await connectWallet(matchingWallet);
        } catch (error) {
          console.error("Failed to reconnect to previous wallet:", error);
          localStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
        }
      }
      
      setReconnectAttempted(true);
    };

    reconnectToPreviousWallet();
  }, [wallets, isInitialized]);

  // Set up and clean up event listeners for the connected provider
  useEffect(() => {
    const provider = providerRef.current;
    if (!provider) return;

    const chainChangedHandler = (chainId: string) => handleChainChanged(chainId, provider);
    const accountsChangedHandler = handleAccountsChanged;

    provider.on?.("chainChanged", chainChangedHandler);
    provider.on?.("accountsChanged", accountsChangedHandler);

    return () => {
      provider.removeListener?.("chainChanged", chainChangedHandler);
      provider.removeListener?.("accountsChanged", accountsChangedHandler);
    };
  }, [providerRef.current]);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
      const accounts = (await providerDetail.provider.request({ method: "eth_requestAccounts" })) as string[];
      const chainIdHex = await providerDetail.provider.request({ method: "eth_chainId" }) as string;
      const chainId = parseInt(chainIdHex, 16);

      // Set the provider ref for event listeners
      providerRef.current = providerDetail.provider;
      
      // Update state
      setProvider(providerDetail.provider);
      setWalletAddress(truncateAddress(accounts[0]));
      setCurrentChain(chainId);
      
      // Save connection information
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS, providerDetail.info.rdns);
      
      return true;
    } catch (error) {
      console.error("Failed to connect provider:", error);
      return false;
    }
  };

  const handleChainChanged = async (chainIdHex: string, _provider: EIP1193Provider) => {
    const chainId = parseInt(chainIdHex, 16);
    setCurrentChain(chainId);
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnect wallet
      setProvider(null);
      setWalletAddress(null);
      setCurrentChain(null);
      providerRef.current = null;
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
    } else {
      // Update address if changed
      setWalletAddress(truncateAddress(accounts[0]));
    }
  };

  const handleDisconnect = () => {
    setProvider(null);
    setWalletAddress(null);
    setCurrentChain(null);
    providerRef.current = null;
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
  };

  return (
    <div className="space-y-2">
      {wallets.length > 0 ? (
        wallets.map((wallet) => (
          <button
            key={wallet.info.uuid}
            onClick={() => connectWallet(wallet)}
            className="w-full p-3 text-left border rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            <img src={wallet.info.icon} alt={wallet.info.name} className="w-6 h-6 inline-block mr-3" />
            {wallet.info.name}
          </button>
        ))
      ) : (
        <p className="text-gray-400">No wallets detected.</p>
      )}
      {/* Disconnect Wallet Button */}
    {providerRef.current && (
      <button
        onClick={handleDisconnect}
        className="w-full p-3 text-left border rounded-lg bg-black hover:bg-red-500 transition text-white mt-4"
      >
        Disconnect Wallet
      </button>
    )}
    </div>
  );
};

export default WalletConnect;