import React from 'react';
import { networkInfoMap } from '../config';

interface ChainSwitchProps {
  currentChain: number | null;
  switchNetwork: (chainId: number) => Promise<void>;
}

const ChainSwitch: React.FC<ChainSwitchProps> = ({ 
  currentChain, 
  switchNetwork 
}) => {
  const availableNetworks = Object.keys(networkInfoMap).map(id => parseInt(id));
  
  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Switch Chain</h3>
      <div className="grid grid-cols-2 gap-2">
        {availableNetworks.map(chainId => (
          <button
            key={chainId}
            onClick={() => switchNetwork(chainId)}
            className={`p-2 rounded-lg transition ${
              currentChain === chainId 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 hover:bg-gray-600 text-gray-300"
            }`}
          >
            {networkInfoMap[chainId]?.chainName || `Chain ${chainId}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChainSwitch;