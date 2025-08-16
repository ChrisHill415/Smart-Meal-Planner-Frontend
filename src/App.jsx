import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Pantry from "./pantry";
import { supabase } from "./supabase";

// 🔹 Login bar component
function LoginBar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
    width: "200px",
    padding: "10px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "1rem",
    height: "40px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "10px 15px",
    marginRight: "10px",
    borderRadius: "5px",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    height: "40px",
  };

  return (
    <div
      style={{
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
      <button onClick={handleLogin} style={{ ...buttonStyle, backgroundColor: "#4CAF50", color: "#fff" }}>Log In</button>
      <button onClick={handleSignup} style={{ ...buttonStyle, backgroundColor: "#2196F3", color: "#fff" }}>Sign Up</button>
      {message && <span style={{ color: "red", marginLeft: "10px" }}>{message}</span>}
    </div>
  );
}

// 🔹 Home page with mission in center
function Home() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "30px", color: "#333" }}>
        Smart Meal Planner
      </h1>
      <p style={{ maxWidth: "600px", fontSize: "1.2rem", color: "#555" }}>
        At Smart Meal Planner, our goal is to help you make the most of your pantry ingredients by providing easy, creative recipes. We aim to reduce food waste, save time, and inspire delicious meals for every day.
      </p>
    </div>
  );
}

// 🔹 Main App
export default function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "Arial, sans-serif" }}>
        <LoginBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pantry" element={<Pantry />} />
        </Routes>
      </div>
    </Router>
  );
}
