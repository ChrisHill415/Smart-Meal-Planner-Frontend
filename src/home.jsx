import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Make body & html fill the viewport and remove default margin
    document.body.style.margin = "0";
    document.body.style.height = "100%";
    document.documentElement.style.height = "100%";
  }, []);

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Check your email to confirm signup!");
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else {
      setMessage("");
      navigate("/pantry");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f8f8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "15px 30px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "200px",
            padding: "10px",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "10px",
            boxSizing: "border-box", // ✅ ensures height includes padding
            height: "40px",          // ✅ fixed height
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "200px",
            padding: "10px",
            fontSize: "1rem",
            border: "1px solid #ccc",
            borderRadius: "5px",
            marginRight: "10px",
            boxSizing: "border-box", // ✅ ensures height matches email input
            height: "40px",          // ✅ fixed height
          }}
        />
        <button
          onClick={handleLogin}
          style={{
            padding: "10px 15px",
            marginRight: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            height: "40px",           // ✅ match input height visually
          }}
        >
          Log In
        </button>
        <button
          onClick={handleSignup}
          style={{
            padding: "10px 15px",
            backgroundColor: "#2196F3",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            height: "40px",           // ✅ match input height visually
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Intro content in center */}
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
