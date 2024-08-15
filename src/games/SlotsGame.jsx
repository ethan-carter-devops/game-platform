import { useState } from "react";
import "./SlotsGame.css";
import SlotMachine from "./SlotsMachine";
import WinProbabilitySetter from "./WinProbabilitySetter";

function SlotsGame({ balance, setBalance }) {
  const [winProbability, setWinProbability] = useState(0.6);
  return (
    <div>
      <main className="p-4">
        <SlotMachine
          winProbability={winProbability}
          balance={balance}
          setBalance={setBalance}
        />
        <WinProbabilitySetter
          winProbability={winProbability}
          setWinProbability={setWinProbability}
        />
      </main>
    </div>
  );
}

export default SlotsGame;
