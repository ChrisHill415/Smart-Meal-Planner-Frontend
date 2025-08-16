import React, { useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom"; // for redirect

export default function Home({ onGetStarted }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Signup
  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email to confirm signup!");
  };

  // Login
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      // ✅ go to pantry after login
      navigate("/pantry");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 🔹 Top Bar with Email/Password Login */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#f8f8f8",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          gap: "10px",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            width: "200px",           // 🔹 fixed width
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "8px",
            width: "200px",           // 🔹 same fixed width
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            padding: "8px 14px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
        <button
          onClick={handleSignup}
          style={{
            padding: "8px 14px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* 🔹 Main Landing Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h1 style={{ fontSize: "3rem", marginBottom: "20px", color: "#333" }}>
          Smart Meal Planner
        </h1>

        <h2 style={{ marginBottom: "20px", color: "#555" }}>Our Mission</h2>
        <p style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#666", maxWidth: "800px" }}>
          At Smart Meal Planner, our goal is to help you make the most of your
          pantry ingredients by providing easy, creative recipes. We aim to
          reduce food waste, save time, and inspire delicious meals for every
          day.
        </p>

        <button
          onClick={onGetStarted}
          style={{
            marginTop: "30px",
            padding: "12px 24px",
            fontSize: "1.1rem",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#4CAF50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>

        {message && (
          <p style={{ marginTop: "20px", color: "red" }}>{message}</p>
        )}
      </div>
    </div>
  );
}
