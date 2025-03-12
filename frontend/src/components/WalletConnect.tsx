import { useEffect, useState } from "react";
import { switchChain, isSupportedChain, LOCAL_STORAGE_KEYS } from "../config/index";


const WalletConnect = () => {
  const [wallets, setWallets] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EIP1193Provider | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentChain, setCurrentChain] = useState<number | null>(null);
  
  useEffect(() => {
    const handleProviderAnnounce = (event: EIP6963AnnounceProviderEvent) => {
      setWallets((prev) => [...prev, event.detail]);
      setIsModalOpen(true);
    };

    window.addEventListener("eip6963:announceProvider", handleProviderAnnounce as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleProviderAnnounce as EventListener);
    };
  }, []);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
      await providerDetail.provider.request({ method: "eth_requestAccounts" });
      setSelectedProvider(providerDetail.provider);
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS, providerDetail.info.rdns);
      setIsModalOpen(false);
      listenForEvents(providerDetail.provider);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };
  
  const listenForEvents = (provider: EIP1193Provider) => {
    provider.on?.("chainChanged", async (chainId: string) => {
      const numericChainId = parseInt(chainId, 16);
      setCurrentChain(numericChainId);
      if (!isSupportedChain(numericChainId)) {
        console.warn("Unsupported chain detected. Attempting to add network.");
        await switchChain(numericChainId, provider);
      }
    });
    
    provider.on?.("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      }
    });
  };

  const disconnectWallet = () => {
    setSelectedProvider(null);
    setCurrentChain(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
  };

  return (
    <div>
      <button 
        onClick={() => (selectedProvider ? disconnectWallet() : setIsModalOpen(true))}
        className={`px-4 py-2 text-white rounded-lg ${selectedProvider ? "bg-red-600" : "bg-blue-600"}`}
      >
        {selectedProvider ? "Disconnect Wallet" : "Connect Wallet"}
      </button>

      {isModalOpen && !selectedProvider && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Select a Wallet</h2>
            {wallets.length > 0 ? (
              wallets.map((wallet) => (
                <button
                  key={wallet.info.uuid}
                  onClick={() => connectWallet(wallet)}
                  className="flex items-center p-2 w-full border rounded-lg mb-2 hover:bg-gray-100"
                >
                  <img src={wallet.info.icon} alt={wallet.info.name} className="w-6 h-6 mr-2" />
                  {wallet.info.name}
                </button>
              ))
            ) : (
              <p>No wallets detected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
