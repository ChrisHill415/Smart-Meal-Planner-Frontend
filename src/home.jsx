import React from "react";
import { supabase } from "./supabase";

export default function Home({ onGetStarted }) {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login error:", error.message);
  };

  const handleSignup = async () => {
    // You can handle signup differently if you want,
    // here we’ll just use Google OAuth for demo.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Signup error:", error.message);
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
      {/* Top Nav */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#f8f8f8",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={handleLogin}
          style={{
            padding: "8px 16px",
            marginRight: "10px",
            border: "1px solid #4CAF50",
            background: "transparent",
            color: "#4CAF50",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Log In
        </button>
        <button
          onClick={handleSignup}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </div>

      {/* Main Content */}
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
      </div>
    </div>
  );
}
