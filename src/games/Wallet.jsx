import React from "react";
import { Heart, Users, Settings } from "lucide-react";
import "./Wallet.css";

const Wallet = ({ balance }) => {
  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>SUPER SLOTS</h1>
        <div className="total-balance">
          Total Balance <span>▼</span>
          <p>${balance.toFixed(2)}</p>
        </div>
      </div>
      <div className="wallet-content">
        <h2>MY ACCOUNT</h2>
        <div className="balance-details">
          <div className="balance-item">
            <span>Total Balance</span>
            <span>${balance.toFixed(2)}</span>
          </div>
          <div className="balance-item">
            <span>Cash Balance</span>
            <span>${((balance * 2) / 3).toFixed(2)}</span>
          </div>
          <div className="balance-item">
            <span>
              Bonus Balance <i>ⓘ</i>
            </span>
            <span>${((balance * 1) / 3).toFixed(2)}</span>
          </div>
          <div className="balance-item sub-item">
            <span>Locked Cash Funds</span>
            <span>${((balance * 1) / 6).toFixed(2)}</span>
          </div>
          <div className="balance-item sub-item">
            <span>Bonus Funds</span>
            <span>${((balance * 1) / 6).toFixed(2)}</span>
          </div>
        </div>
        <button className="deposit-button">DEPOSIT NOW</button>
        <button className="withdraw-button">WITHDRAW</button>
        <div className="action-buttons">
          <div className="action-item">
            <Heart />
            <span>My Bonus</span>
          </div>
          <div className="action-item">
            <Users />
            <span>Refer A Friend</span>
          </div>
          <div className="action-item">
            <Settings />
            <span>Profile Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
