import React, { useState } from "react";
import SlotsGame from "./SlotsGame";
import Wallet from "./Wallet";
import "./SlotsGameApp.css";

function SlotsGameApp() {
  const [balance, setBalance] = useState(20670000);
  return (
    <div className="app-container">
      <div className="slots-container">
        <SlotsGame balance={balance} setBalance={setBalance} />
      </div>
      <div className="wallet-container">
        <Wallet balance={balance} />
      </div>
    </div>
  );
}

export default SlotsGameApp;
