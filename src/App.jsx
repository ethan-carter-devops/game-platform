import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./App.module.css";
import api, { removeToken, getStoredToken, storeToken } from "./api";

const Greeting = ({ userName }) => {
  if (!userName) return null;
  return <p className={styles.greeting}>Greetings, {userName}!</p>;
};

const AccountBalance = ({ accountBalance }) => (
  <div className={styles.accountBalance}>
    <p>Account Balance: ${JSON.stringify(accountBalance)}</p>
  </div>
);

const App = () => {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [appSession, setAppSession] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          const userData = jwtDecode(storedToken.access_token);
          await refreshToken(storedToken);
          await getBalance(storedToken);
          setAppSession(storedToken);
          setUserName(userData.user_metadata.full_name);
        } catch (error) {
          console.error("Failed to initialize app:", error);
          removeToken();
        }
      }
    };

    initializeApp();
  }, []);

  const refreshToken = async (session) => {
    try {
      const {
        data: { session: newSession },
      } = await api.post("/auth/refresh", {
        refresh_token: session.refresh_token,
      });
      storeToken(newSession);
      setAppSession(newSession);
      return newSession;
    } catch (error) {
      console.error("Token refresh failed:", error);
      throw error;
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    const {
      data: { message, user, session },
    } = await sendAPIsignin(credentialResponse);
    console.log("Login Success:", user);
    setMessage(message);
    const sessionToken = session;
    const userData = jwtDecode(sessionToken.access_token);
    storeToken(sessionToken);
    setAppSession(sessionToken);
    setUserName(userData.user_metadata.full_name);
    await getBalance(sessionToken);
  };

  const getBalance = async (session) => {
    try {
      const response = await api.get("/account", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setAccountBalance(response.data);
    } catch (error) {
      console.debug("getBalance Failed:", error);
      if (error.response?.status === 401) {
        try {
          const newSession = await refreshToken(session);
          const retryResponse = await api.get("/account", {
            headers: { Authorization: `Bearer ${newSession.access_token}` },
          });
          setAccountBalance(retryResponse.data);
        } catch (refreshError) {
          console.error(
            "Failed to refresh token and get balance:",
            refreshError
          );
          throw refreshError;
        }
      } else {
        throw error;
      }
    }
  };

  const sendAPIsignin = async (credentialResponse) => {
    const {
      email,
      family_name: lastName,
      given_name: firstName,
    } = jwtDecode(credentialResponse.credential);
    return api.post(
      "/auth",
      {
        credential: credentialResponse.credential,
        email,
        lastName,
        firstName,
        auth: "google",
      },
      { headers: { Authorization: credentialResponse.credential } }
    );
  };

  const onGoogleError = () => {
    console.log("Login Failed");
    setError("Authentication failed. Please try again.");
  };

  const logout = () => {
    removeToken();
    setUserName("");
    setAppSession(null);
    setAccountBalance(null);
    setMessage("You have been logged out.");
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Login Games Platform</h1>
        <p className={styles.subtitle}>Sign in to start playing</p>
        {!appSession ? (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              useOneTap
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="pill"
            />
          </GoogleOAuthProvider>
        ) : (
          <button onClick={logout} className={styles.logoutButton}>
            Logout
          </button>
        )}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
        <Greeting userName={userName} />
        {accountBalance && <AccountBalance accountBalance={accountBalance} />}
      </div>
    </div>
  );
};

export default App;
