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

  useEffect(() => {
    fetchPantryItems();
  }, []);

  // Fetch pantry items from backend
  async function fetchPantryItems() {
    try {
      const res = await axios.get("/pantry/list");
      setItems(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pantry:", err.response?.data || err.message);
      setError("Failed to fetch pantry items.");
    }
  }

  // Add item
  async function addItem(e) {
    e.preventDefault();
    setError(null);

    if (!item || !quantity) return setError("Enter both name and quantity.");

    try {
      const body = {
        item: item.trim(),
        quantity: Number(quantity),
        unit: "" // unit is required by backend model
      };
      const res = await axios.post("/pantry/add", body);
      console.log("Added item:", res.data);
      setItem("");
      setQuantity("");
      fetchPantryItems();
    } catch (err) {
      console.error("Failed to add item:", err.response?.data || err.message);
      setError("Failed to add item. Check console for details.");
    }
  }

  // Remove item
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

  // Get AI recipes
  async function handleGetRecipes() {
    if (items.length === 0) {
      setRecipes([{ title: "Add pantry items first", ingredients: [], instructions: "" }]);
      return;
    }

    setLoading(true);
    setError(null);

    const pantryList = items.map((i) => i.item);
    const prompt = `I have the following ingredients: ${pantryList.join(
      ", "
    )}. Suggest 3 easy recipes I can make with them. Return as JSON with title, ingredients, instructions.`;

    try {
      const res = await axios.post("/recipes", { prompt });
      const aiRecipes = res.data.recipes;

      if (Array.isArray(aiRecipes)) setRecipes(aiRecipes);
      else setRecipes([{ title: "AI Response", ingredients: [], instructions: aiRecipes?.toString() || "" }]);
    } catch (err) {
      console.error("Failed to fetch AI recipes:", err.response?.data || err.message);
      setRecipes([{ title: "Error", ingredients: [], instructions: "Failed to fetch recipes." }]);
      setError("Failed to fetch AI recipes.");
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
            <button onClick={() => removeItem(item.id)}>Remove</button>
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
