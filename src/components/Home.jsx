import React from "react";
import styles from "./Home.module.css";
import SlotsGameApp from "../games/SlotsGameApp";

const Home = ({ userName, accountBalance, logout }) => (
  <div className={styles.container}>
    <header className={styles.header}>
      <h1 className={styles.logo}>Casino Royale</h1>
      <nav className={styles.nav}>
        <button className={styles.navButton}>Games</button>
        <button className={styles.navButton}>Promotions</button>
        <button className={styles.navButton}>VIP</button>
        <button className={styles.navButton}>Support</button>
      </nav>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{userName}</span>
        {accountBalance && (
          <span className={styles.balance}>${accountBalance}</span>
        )}
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
    <main className={styles.main}>
      <SlotsGameApp />
    </main>
  </div>
);

export default Home;
