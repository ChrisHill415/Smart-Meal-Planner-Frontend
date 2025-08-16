import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./home";
import Pantry from "./pantry";
import { supabase } from "./supabase";

// 🔹 Login Component inside App for clarity
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error.message);
    } else {
      navigate("/pantry"); // ✅ go to Pantry after login
    }
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Signup error:", error.message);
    } else {
      navigate("/pantry"); // ✅ go to Pantry after signup
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f0f0",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Login / Signup</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "250px",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "250px",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />
      <button
        onClick={handleLogin}
        style={{
          width: "250px",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#4CAF50",
          color: "white",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Login
      </button>
      <button
        onClick={handleSignup}
        style={{
          width: "250px",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#2196F3",
          color: "white",
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Signup
      </button>
    </div>
  );
}

export default function App() {
  const [showLogin, setShowLogin] = useState(false);

  const handleGetStarted = () => {
    setShowLogin(true);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            showLogin ? <Login /> : <Home onGetStarted={handleGetStarted} />
          }
        />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </Router>
  );
}
