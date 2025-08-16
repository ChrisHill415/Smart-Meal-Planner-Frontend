import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./home";
import Pantry from "./pantry";
import { supabase } from "./supabase";

// 🔹 Login Component
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#f8f8f8";
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else navigate("/pantry");
  };

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else navigate("/pantry");
  };

  const inputStyle = {
    width: "250px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    height: "40px",
    lineHeight: "normal",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "250px",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    height: "40px",
    lineHeight: "normal",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleLogin} style={{ ...buttonStyle, backgroundColor: "#4CAF50", color: "#fff" }}>
          Log In
        </button>
        <button onClick={handleSignup} style={{ ...buttonStyle, backgroundColor: "#2196F3", color: "#fff" }}>
          Sign Up
        </button>
      </div>

      {/* Intro / center content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "30px", color: "#333" }}>
          Smart Meal Planner
        </h1>
        <p style={{ maxWidth: "800px", fontSize: "1.2rem", color: "#555" }}>
          At Smart Meal Planner, our goal is to help you make the most of your
          pantry ingredients by providing easy, creative recipes. We aim to
          reduce food waste, save time, and inspire delicious meals for every
          day.
        </p>
        {message && <p style={{ color: "red", marginTop: "20px" }}>{message}</p>}
      </div>
    </div>
  );
}

// 🔹 Main App Component
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
          element={showLogin ? <Login /> : <Home onGetStarted={handleGetStarted} />}
        />
        <Route path="/pantry" element={<Pantry />} />
      </Routes>
    </Router>
  );
}
