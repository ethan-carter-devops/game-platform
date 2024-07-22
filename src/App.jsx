import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./App.module.css";
import { supabase } from "./supabase";

function Greeting({ userName }) {
  return (
    <>
      {userName === "" ? null : (
        <p className={styles.greeting}>Greetings, {userName}!</p>
      )}
    </>
  );
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const App = () => {
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(""); // New state for handling errors
  const [message, setMessage] = useState(""); // New state for handling errors

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await sendAPIsignin(credentialResponse);
      console.log("Login Success:", response.data);
      setMessage(response.data.message);
    } catch (error) {
      const {
        data: { session, user },
        error: errorSupabase,
      } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });
      console.log(session);
      if (errorSupabase) {
        setError("Please remove browser ad blockers and try again."); // Update error message
        console.debug("Login Failed:", errorSupabase);
        throw new Error(errorSupabase);
      }
      setMessage(`User logged successfully as ${user.email}`);
    }
  };
  async function sendAPIsignin(credentialResponse) {
    const credentialResponseDecoded = jwtDecode(credentialResponse.credential);
    const {
      email,
      family_name: lastName,
      given_name: firstName,
      name,
    } = credentialResponseDecoded;
    setUserName(name);
    return await api.post(
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
  }
  const onGoogleError = () => {
    console.log("Login Failed");
    setError("Authentication failed. Please try again."); // Handle other authentication errors
  };

  return (
    <div className={styles.container}>
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
        {error && <p className={styles.errorMessage}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}
        <Greeting userName={userName} />
      </div>
    </div>
  );
};

export default App;
