import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setMessage("Check your email for the login link!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    // Logged-in view
    return (
      <div style={styles.fullScreen}>
        <h1>Welcome, {user.email}</h1>
        <p>Your pantry and recipes would appear here.</p>
        <button style={styles.button} onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (showLogin) {
    // Login form
    return (
      <div style={styles.fullScreen}>
        <h1>Login / Signup</h1>
        <form onSubmit={handleLogin} style={{ marginTop: "20px" }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <br />
          <button type="submit" style={styles.button}>Get Started</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {message && <p style={{ color: "green" }}>{message}</p>}
        <button style={{ ...styles.button, marginTop: "10px" }} onClick={() => setShowLogin(false)}>Back</button>
      </div>
    );
  }

  // Homepage view
  return (
    <div style={styles.fullScreen}>
      <h1 style={{ marginBottom: "50px" }}>Smart Meal Planner</h1>
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px" }}>Our Mission</h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>
          At Smart Meal Planner, our goal is to help you make the most of your pantry ingredients
          by providing easy, creative recipes. We aim to reduce food waste, save time, and
          inspire delicious meals for every day.
        </p>
        <button style={{ ...styles.button, marginTop: "20px" }} onClick={() => setShowLogin(true)}>
          Get Started
        </button>
      </div>
    </div>
  );
}

// Styles
const styles = {
  fullScreen: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100%",
    textAlign: "center",
    padding: "20px",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    backgroundColor: "#242424",
    color: "#fff",
  },
  card: {
    maxWidth: "600px",
    backgroundColor: "#1a1a1a",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  button: {
    borderRadius: "8px",
    border: "1px solid transparent",
    padding: "0.6em 1.2em",
    fontSize: "1em",
    fontWeight: 500,
    fontFamily: "inherit",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    width: "250px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
};
