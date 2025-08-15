import React from "react";

export default function Home() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        textAlign: "center",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f8f8",
      }}
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
      </div>
    </div>
  );
}
