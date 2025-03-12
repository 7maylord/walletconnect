import { useEffect, useState, useCallback } from "react";
import { LOCAL_STORAGE_KEYS, networkInfoMap, isSupportedChain } from "../config/index";
import { truncateAddress } from "../utils/helpers";

interface WalletConnectProps {
  setProvider: React.Dispatch<any>;
  setCurrentChain: React.Dispatch<React.SetStateAction<number | null>>;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ setProvider, setCurrentChain, setWalletAddress }) => {
  const [wallets, setWallets] = useState<EIP6963ProviderDetail[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<EIP1193Provider | null>(null);
  const [isUnsupported, setIsUnsupported] = useState(false);

  const handleProviderAnnounce = useCallback((event: any) => {
    setWallets((prev) => {
      const walletMap = new Map(prev.map((wallet) => [wallet.info.uuid, wallet]));
      if (!walletMap.has(event.detail.info.uuid)) {
        walletMap.set(event.detail.info.uuid, event.detail);
      }
      return Array.from(walletMap.values());
    });
  }, []);

  useEffect(() => {
    window.addEventListener("eip6963:announceProvider", handleProviderAnnounce as unknown as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleProviderAnnounce as unknown as EventListener);
    };
  }, [handleProviderAnnounce]);

  const connectWallet = async (providerDetail: EIP6963ProviderDetail) => {
    try {
      const accounts = (await providerDetail.provider.request({ method: "eth_requestAccounts" })) as string[];

      setSelectedProvider(providerDetail.provider);
      setProvider(providerDetail.provider);
      setWalletAddress(truncateAddress(accounts[0]));
      localStorage.setItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS, providerDetail.info.rdns);
      listenForEvents(providerDetail.provider);
    } catch (error) {
      console.error("Failed to connect provider:", error);
    }
  };

  const listenForEvents = (provider: EIP1193Provider) => {
    provider.removeListener?.("chainChanged", handleChainChanged);
    provider.removeListener?.("accountsChanged", handleAccountsChanged);

    provider.on?.("chainChanged", handleChainChanged);
    provider.on?.("accountsChanged", handleAccountsChanged);
  };

  const handleChainChanged = async (chainId: string) => {
    const numericChainId = parseInt(chainId, 16);
    setCurrentChain(numericChainId);
    setIsUnsupported(!isSupportedChain(numericChainId));

    if (!isSupportedChain(numericChainId)) return;

    try {
      await selectedProvider?.request({
        method: "wallet_addEthereumChain",
        params: [networkInfoMap[numericChainId]],
      });
    } catch (error) {
      console.error("User rejected adding network:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setProvider(null);
      setWalletAddress(null);
      setCurrentChain(null);
      setIsUnsupported(false);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.PREVIOUSLY_CONNECTED_PROVIDER_RDNS);
    }
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
    </div>
  );
};

export default WalletConnect;
