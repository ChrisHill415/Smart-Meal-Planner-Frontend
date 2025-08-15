import React, { useState } from "react";
import Home from "./home";
import { supabase } from "./supabase";

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  const handleLoginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div style={{ height: "100vh", margin: 0 }}>
      {showLogin ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h1 style={{ marginBottom: "20px" }}>Login</h1>
          <button
            onClick={handleLoginWithGoogle}
            style={{
              padding: "10px 20px",
              fontSize: "1rem",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#4285F4",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Login with Google
          </button>
        </div>
      ) : (
        <Home onGetStarted={handleGetStarted} />
      )}
    </div>
  );
}
