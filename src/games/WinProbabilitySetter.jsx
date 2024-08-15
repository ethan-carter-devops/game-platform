// WinProbabilitySetter.jsx
import React from "react";

const WinProbabilitySetter = ({ winProbability, setWinProbability }) => {
  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md max-w-lg mx-auto mt-4">
      <label className="block text-lg font-bold mb-2">
        Set Win Probability:
      </label>
      <input
        type="number"
        value={winProbability}
        onChange={(e) => setWinProbability(parseFloat(e.target.value))}
        className="w-full p-2 rounded bg-gray-700 text-white"
        min="0"
        max="1"
        step="0.01"
      />
    </div>
  );
};

export default WinProbabilitySetter;
