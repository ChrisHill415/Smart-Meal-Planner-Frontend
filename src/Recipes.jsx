import React from "react";

export default function Recipes({ recipes }) {
  if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
    return <p>No recipes to display.</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        flexWrap: "wrap",
        marginTop: "20px",
      }}
    >
      {recipes.map((r, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: "#333",
            color: "#fff",
            border: "1px solid #555",
            padding: "15px",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
            flex: "1 1 300px",
            minWidth: "250px",
          }}
        >
          <h3>{r.title}</h3>
          <p>{r.instructions}</p>
        </div>
      ))}
    </div>
  );
}
