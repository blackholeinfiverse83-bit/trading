import React from 'react';

const TierSelector: React.FC = () => {
  const activeTier = 'SEED';

  return (
    <div className="flex gap-2 p-2 bg-gray-800 rounded-lg">
      <button
        onClick={() => setActiveTier('SEED')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTier === 'SEED'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        SEED
      </button>
      <button
        onClick={() => setActiveTier('TREE')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          activeTier === 'TREE'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        TREE
      </button>
      <button
        onClick={() => setActiveTier('SKY')}
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