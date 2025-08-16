import React from "react";
import { supabase } from "./supabase";

export default function Home({ onGetStarted }) {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", // full height
        width: "100vw",  // full width
        textAlign: "center",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff", // white background everywhere
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
  );
}
