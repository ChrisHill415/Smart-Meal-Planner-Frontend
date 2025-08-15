import React, { useState, useEffect } from "react";
import axios from "axios";
import Recipes from "./Recipes";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch pantry items on load
  useEffect(() => {
    fetchPantryItems();
  }, []);

  async function fetchPantryItems() {
    try {
      const response = await axios.get("/pantry/list");
      setItems(response.data || []);
    } catch (err) {
      console.error("Failed to fetch pantry items:", err.response?.data || err.message);
      setError("Failed to fetch pantry items.");
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);

    if (!item || !quantity) {
      return setError("Enter both name and quantity.");
    }

    try {
      const body = { item, quantity: Number(quantity), unit: "" };
      await axios.post("/pantry/add", body);
      setItem("");
      setQuantity("");
      fetchPantryItems();
    } catch (err) {
      console.error("Failed to add item:", err.response?.data || err.message);
      setError("Failed to add item. Check console for details.");
    }
  }

  async function removeItem(itemId) {
    setError(null);
    try {
      await axios.delete(`/pantry/remove/${itemId}`);
      fetchPantryItems();
    } catch (err) {
      console.error("Failed to remove item:", err.response?.data || err.message);
      setError("Failed to remove item. Check console for details.");
    }
  }

  async function handleGetRecipes() {
    if (items.length === 0) {
      setRecipes([{ title: "Add pantry items first", ingredients: [], instructions: "" }]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/recipes/suggest");
      const aiRecipes = response.data;
      if (Array.isArray(aiRecipes)) {
        setRecipes(aiRecipes);
      } else {
        setRecipes([{ title: "AI Response", ingredients: [], instructions: aiRecipes?.toString() || "" }]);
      }
    } catch (err) {
      console.error("Failed to fetch recipes:", err.response?.data || err.message);
      setRecipes([{ title: "Error", ingredients: [], instructions: "Failed to fetch recipes." }]);
      setError("Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  }

  // Group and sort pantry items
  const groupedItems = Object.values(
    items.reduce((acc, curr) => {
      const name = curr.item.trim().toLowerCase();
      if (!acc[name]) {
        acc[name] = { id: curr.id, name: curr.item, quantity: Number(curr.quantity) || 0 };
      } else {
        acc[name].quantity += Number(curr.quantity) || 0;
      }
      return acc;
    }, {})
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h2>Pantry Items</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {groupedItems.map((item) => (
          <li key={item.id}>
            {item.name} — {item.quantity}{" "}
            <button
              onClick={() => removeItem(item.id)}
              style={{ marginLeft: "10px" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={addItem} style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Item name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min={1}
        />
        <button type="submit">Add Item</button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleGetRecipes} disabled={loading}>
          {loading ? "Fetching Recipes..." : "Get Recipes"}
        </button>
      </div>

      <Recipes recipes={recipes} />
    </div>
  );
}
