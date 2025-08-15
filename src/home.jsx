import React from "react";
import { supabase } from "./supabase";

export default function Home() {
  const handleLogin = async () => {
    // Redirect to Supabase login/signup flow
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google" // or email/password
    });
    if (error) console.error("Login error:", error.message);
  };

  return (
    
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100%",  // use 100% so it fills parent
        width: "100%",
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f8f8",
      }}
    >

    >
      {/* Top Title */}
      <h1 style={{ fontSize: "3rem", marginBottom: "50px", color: "#333" }}>
        Smart Meal Planner
      </h1>

      {/* Mission Section */}
      <div
        style={{
          maxWidth: "600px",
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "#555" }}>Our Mission</h2>
        <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#666" }}>
          At Smart Meal Planner, our goal is to help you make the most of your
          pantry ingredients by providing easy, creative recipes. We aim to
          reduce food waste, save time, and inspire delicious meals for every
          day.
        </p>
        <button
          onClick={handleLogin}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "1rem",
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
