import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HashRouter as Router } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import styles from "./App.module.css";
import api from "./api";
import Home from "./components/Home";

// Constants for paths
const BASENAME = "/game-platform/";
const LOGIN_PATH = "/login";
const HOME_PATH = "/home";
const ROOT_PATH = "/";
const WILDCARD_PATH = "*";

const Login = ({ onGoogleSuccess, onGoogleError }) => (
  <div className={styles.loginCard}>
    <h1 className={styles.title}>Login Games Platform</h1>
    <p className={styles.subtitle}>Sign in to start playing</p>
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
  </div>
);

const LoginApp = ({
  basename = BASENAME,
  loginPath = LOGIN_PATH,
  homePath = HOME_PATH,
  rootPath = ROOT_PATH,
  wildcardPath = WILDCARD_PATH,
}) => {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [appSession, setAppSession] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const { data: { user = {}, data = null } = {} } = await getBalance();
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name);
          setAccountBalance(data);
          setAppSession(true); // Assume authenticated if user data is present
        }
      } catch (error) {
        console.debug("Authentication check failed:", error);
      } finally {
        setLoading(false); // Set loading to false after the check
      }
    };

    checkAuthentication();
  }, []);

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const {
        data: { message, user, session },
      } = await sendAPIsignin(credentialResponse);
      setMessage(message);
      const sessionToken = session;
      const userData = jwtDecode(sessionToken.access_token);
      setAppSession(sessionToken);
      setUserName(userData.user_metadata.full_name);
    } catch (error) {
      setError("Authentication failed. Please try again.");
    }
  };

  const onGoogleError = () => {
    setError("Authentication failed. Please try again.");
  };

  const getBalance = async () => {
    try {
      const { data } = await api.get("/account");
      return data;
    } catch (error) {
      console.debug("getBalance Failed:", error);
    }
    return {};
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
      {
        headers: {
          Authorization: credentialResponse.credential,
        },
      }
    );
  };

  const logout = async () => {
    setUserName("");
    setAppSession(null);
    setAccountBalance(null);
    setMessage("You have been logged out.");
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      setMessage("There was an issue logging out. Please try again.");
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optionally show a loading state while checking auth
  }

  return (
    <Router>
      <div className={styles.container}>
        <Routes>
          <Route
            path={rootPath}
            element={
              appSession ? (
                <Navigate to={homePath} />
              ) : (
                <Navigate to={loginPath} />
              )
            }
          />
          <Route
            path={loginPath}
            element={
              appSession ? (
                <Navigate to={homePath} />
              ) : (
                <Login
                  onGoogleSuccess={onGoogleSuccess}
                  onGoogleError={onGoogleError}
                />
              )
            }
          />
          <Route
            path={homePath}
            element={
              appSession ? (
                <Home
                  userName={userName}
                  accountBalance={accountBalance}
                  logout={logout}
                />
              ) : (
                <Navigate to={loginPath} />
              )
            }
          />
          <Route path={wildcardPath} element={<Navigate to={rootPath} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default LoginApp;
