import React, { useState, useEffect, useCallback } from "react";

const SYMBOLS = ["💎", "🍒", "🎲", "🔔", "7️⃣", "BAR", "🍋", "🍉", "🍇"];
const PAYOUTS = {
  "💎": 50,
  "🍒": 40,
  "🎲": 30,
  "🔔": 20,
  "7️⃣": 15,
  BAR: 10,
  "🍋": 5,
  "🍉": 5,
  "🍇": 5,
};

const ROWS = 3;
const COLS = 5;

const SlotMachine = ({ balance, setBalance, winProbability = 0.6 }) => {
  const generateReelStrip = useCallback(() => {
    return Array(30)
      .fill()
      .map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }, []);

  const initialReels = useCallback(() => {
    return Array(COLS)
      .fill()
      .map(() => generateReelStrip());
  }, [generateReelStrip]);

  const [reels, setReels] = useState(initialReels);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(10000);
  const [win, setWin] = useState(0);
  const [winningRows, setWinningRows] = useState([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  const spin = useCallback(() => {
    if (balance < bet || spinning) return;

    setSpinning(true);
    setBalance((prev) => prev - bet);
    setWin(0);
    setWinningRows([]);
    setShowWinAnimation(false);

    const spinDuration = 3000;
    const isWin = Math.random() < winProbability;

    const newReels = Array(COLS)
      .fill()
      .map(() => generateReelStrip());

    if (isWin) {
      const winningSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const winningRow = Math.floor(Math.random() * ROWS);
      for (let i = 0; i < 3; i++) {
        newReels[i][winningRow] = winningSymbol;
      }
    }

    const spinInterval = setInterval(() => {
      setReels((prevReels) =>
        prevReels.map((reel) => {
          const newReel = [...reel];
          newReel.unshift(newReel.pop());
          return newReel;
        })
      );
    }, 100);

    setTimeout(() => {
      clearInterval(spinInterval);
      setSpinning(false);
      setReels(newReels);
      calculateWin(
        newReels.map((reel) => reel.slice(0, ROWS)),
        isWin
      );
    }, spinDuration);
  }, [balance, bet, spinning, generateReelStrip, winProbability]);

  const calculateWin = useCallback(
    (finalReels, isWin) => {
      let totalWin = 0;
      const winningRowsIndices = [];

      if (isWin) {
        for (let row = 0; row < ROWS; row++) {
          const rowSymbols = finalReels.map((reel) => reel[row]);
          const symbolCounts = rowSymbols.reduce((acc, symbol) => {
            acc[symbol] = (acc[symbol] || 0) + 1;
            return acc;
          }, {});

          const maxCount = Math.max(...Object.values(symbolCounts));
          const winningSymbol = Object.keys(symbolCounts).find(
            (symbol) => symbolCounts[symbol] === maxCount
          );

          if (maxCount >= 3) {
            const rowWin = bet * PAYOUTS[winningSymbol] * (maxCount - 2);
            totalWin += rowWin;
            winningRowsIndices.push(row);
          }
        }
      }

      if (totalWin > 0) {
        setWin(totalWin);
        setBalance((prev) => prev + totalWin);
        setWinningRows(winningRowsIndices);
        setShowWinAnimation(true);
      }
    },
    [bet]
  );

  return (
    <div className="p-4 bg-gradient-to-b from-purple-900 to-purple-700 text-white rounded-lg shadow-xl max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-yellow-500 to-yellow-700 p-2 rounded-lg">
        <div className="text-2xl font-bold">💰 ${balance.toLocaleString()}</div>
        <div className="text-xl bg-blue-600 px-4 py-1 rounded-full">
          Level 3
        </div>
      </div>
      <div className="grid grid-cols-5 gap-1 mb-4 bg-gradient-to-b from-purple-800 to-purple-900 p-4 rounded-lg overflow-hidden h-80 relative">
        {reels.map((reel, i) => (
          <div key={i} className="relative h-full overflow-hidden">
            <div
              className={`absolute inset-0 flex flex-col transition-transform duration-100 ease-linear ${
                spinning ? "-translate-y-1/3" : ""
              }`}
              style={{ height: "150%" }}
            >
              {[...reel, ...reel.slice(0, ROWS)].map((symbol, j) => (
                <div
                  key={j}
                  className={`flex items-center justify-center h-1/6 text-6xl ${
                    !spinning && winningRows.includes(j % ROWS)
                      ? "animate-pulse bg-yellow-500 bg-opacity-50"
                      : ""
                  }`}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        ))}
        {showWinAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-6xl font-bold text-yellow-400 animate-bounce">
              BIG WIN!
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-lg">
        <button
          onClick={() => setBet(Math.max(1000, bet - 1000))}
          className="bg-red-500 px-6 py-3 rounded-full text-2xl font-bold shadow-lg transition-all hover:bg-red-600 active:scale-95"
          disabled={spinning}
        >
          -
        </button>
        <div className="text-2xl font-bold">Bet: ${bet.toLocaleString()}</div>
        <button
          onClick={() => setBet(Math.min(100000, bet + 1000))}
          className="bg-green-500 px-6 py-3 rounded-full text-2xl font-bold shadow-lg transition-all hover:bg-green-600 active:scale-95"
          disabled={spinning}
        >
          +
        </button>
        <button
          onClick={spin}
          disabled={spinning || balance < bet}
          className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-3 rounded-full disabled:opacity-50 text-2xl font-bold shadow-lg transition-all hover:from-green-600 hover:to-green-700 active:scale-95"
        >
          {spinning ? "Spinning..." : "SPIN"}
        </button>
      </div>
      {win > 0 && (
        <div className="mt-4 text-3xl font-bold text-yellow-400 text-center animate-pulse">
          You won ${win.toLocaleString()}!
        </div>
      )}
    </div>
  );
};

export default SlotMachine;
