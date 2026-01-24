import React, { useState } from 'react';

interface TierSelectorProps {
  onTierChange?: (tier: 'SEED' | 'TREE' | 'SKY') => void;
}

const TierSelector: React.FC<TierSelectorProps> = ({ onTierChange }) => {
  const [activeTier, setActiveTier] = useState<'SEED' | 'TREE' | 'SKY'>('SEED');

  const handleTierChange = (tier: 'SEED' | 'TREE' | 'SKY') => {
    setActiveTier(tier);
    if (onTierChange) {
      onTierChange(tier);
    }
  };

  return (
    <div className="flex gap-2 p-2 bg-gray-800 rounded-lg">
      <button
        onClick={() => handleTierChange('SEED')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTier === 'SEED'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        SEED
      </button>
      <button
        onClick={() => handleTierChange('TREE')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTier === 'TREE'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        TREE
      </button>
      <button
        onClick={() => handleTierChange('SKY')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTier === 'SKY'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        SKY
      </button>
    </div>
  );
};

export default TierSelector;