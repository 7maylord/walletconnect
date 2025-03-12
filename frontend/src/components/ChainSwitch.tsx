import { useState, useEffect } from "react";
import { switchChain, isSupportedChain, networkInfoMap, SupportedChainId } from "../config/index";

interface ChainSwitcherProps {
  provider: any;
  currentChain: number | null;
}

const ChainSwitch = ({ provider, currentChain }: ChainSwitcherProps) => {
  const [isUnsupported, setIsUnsupported] = useState(false);

  // Update unsupported status when chain changes
  useEffect(() => {
    setIsUnsupported(!isSupportedChain(currentChain ?? 0));
  }, [currentChain]);

  const handleChainChange = async (chainId: number) => {
    if (!provider) return;
    
    try {
      await switchChain(chainId, provider);
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Select Network</h3>
      {isUnsupported && (
        <div className="bg-yellow-800 text-yellow-100 p-2 mb-2 rounded-lg text-sm">
          Current network is not supported
        </div>
      )}
      <select
        value={currentChain || ""}
        onChange={(e) => handleChainChange(Number(e.target.value))}
        className="p-2 border rounded-lg w-full bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        disabled={!provider}
      >
        <option value="" disabled>Select a network</option>
        {Object.values(SupportedChainId)
          .filter((value) => typeof value === 'number')
          .map((chainId) => (
            <option key={chainId} value={chainId}>
              {networkInfoMap[chainId as number]?.chainName || `Chain ${chainId}`}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ChainSwitch;