import { useEffect, useState } from "react";
import { switchChain, isSupportedChain, networkInfoMap } from "../config/index";

interface ChainSwitcherProps {
  provider: any;
  currentChain: number | null;
}

const ChainSwitch = ({ provider, currentChain }: ChainSwitcherProps) => {
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [isUnsupported, setIsUnsupported] = useState(false);

  useEffect(() => {
    if (currentChain !== selectedChain) {
      setSelectedChain(currentChain);
      setIsUnsupported(!isSupportedChain(currentChain ?? 0));
    }
  }, [currentChain, selectedChain]);

  const handleChainChange = async (chainId: number) => {
    try {
      await switchChain(chainId, provider);
      setSelectedChain(chainId);

      await provider.request({
        method: "wallet_addEthereumChain",
        params: [networkInfoMap[chainId]],
      });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Select Network</h3>
      <select
        value={selectedChain || ""}
        onChange={(e) => handleChainChange(Number(e.target.value))}
        className="p-2 border rounded-lg w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {Object.keys(networkInfoMap).map((chain) => (
          <option key={chain} value={chain}>
            {isSupportedChain(Number(chain)) ? `Chain ${chain}` : `Unsupported Chain ${chain}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChainSwitch;
