import React from 'react';

export default function Recipes({ recipes }) {
  if (!recipes || recipes.length === 0) {
    return <p>No recipes to display.</p>;
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Suggested Recipes:</h3>
      {recipes.map((r, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '15px',
            borderBottom: '1px solid #ccc',
            paddingBottom: '10px',
          }}
        >
          <h4>{r.title}</h4>
          {r.ingredients && r.ingredients.length > 0 && (
            <p>
              <strong>Ingredients:</strong> {r.ingredients.join(', ')}
            </p>
          )}
          <p>
            <strong>Instructions:</strong> {r.instructions}
          </p>
        </div>
      ))}
    </div>
  );
}
