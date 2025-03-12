import { useEffect, useState } from "react";
import { switchChain, isSupportedChain, SupportedChainId } from "../config/index";

interface ChainSwitcherProps {
  provider: any;
  currentChain: number | null;
}

const ChainSwitch = ({ provider, currentChain }: ChainSwitcherProps) => {
  const [selectedChain, setSelectedChain] = useState<number | null>(null);

  useEffect(() => {
    if (currentChain) {
      setSelectedChain(currentChain);
    }
  }, [currentChain]);

  const handleChainChange = async (chainId: number) => {
    await switchChain(chainId, provider);
    setSelectedChain(chainId);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Select Network</h3>
      <select
        value={selectedChain || ""}
        onChange={(e) => handleChainChange(Number(e.target.value))}
        className="p-2 border rounded-lg"
      >
        {Object.values(SupportedChainId).map((chain) =>
          typeof chain === "number" ? (
            <option key={chain} value={chain}>
              {isSupportedChain(chain) ? `Chain ${chain}` : `Unsupported Chain ${chain}`}
            </option>
          ) : null
        )}
      </select>
    </div>
  );
};

export default ChainSwitch;
