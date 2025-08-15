import React from "react";

export default function Recipes({ recipes }) {
  if (!recipes || recipes.length === 0) {
    <p>Hope you enjoy!</p>
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Suggested Recipes:</h3>
      {recipes.map((r, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h4 style={{ marginBottom: "10px" }}>{r.title || "Untitled Recipe"}</h4>

          {r.ingredients && r.ingredients.length > 0 ? (
            <ul style={{ marginBottom: "10px" }}>
              {r.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p><strong>Ingredients:</strong> Not provided</p>
          )}

          <p>
            <strong>Instructions:</strong>{" "}
            {r.instructions || "No instructions provided."}
          </p>
        </div>
      ))}
    </div>
  );
}
