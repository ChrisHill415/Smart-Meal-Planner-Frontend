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
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const res = await axios.get("/pantry/list");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch pantry items.");
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);
    if (!item || !quantity) return setError("Enter both name and quantity.");

    try {
      await axios.post("/pantry/add", {
        item,
        quantity: Number(quantity),
        unit: "",
      });
      setItem("");
      setQuantity("");
      fetchItems();
    } catch (err) {
      console.error(err);
      setError("Failed to add item.");
    }
  }

  async function removeItem(itemId) {
    setError(null);
    try {
      await axios.delete(`/pantry/remove/${itemId}`);
      fetchItems();
    } catch (err) {
      console.error(err);
      setError("Failed to remove item.");
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
      const res = await axios.get("/recipes/suggest");
      const aiRecipes = res.data;

      if (Array.isArray(aiRecipes)) setRecipes(aiRecipes);
      else setRecipes([{ title: "AI Response", ingredients: [], instructions: aiRecipes.toString() }]);
    } catch (err) {
      console.error("Failed to fetch AI recipes:", err);
      setRecipes([{ title: "Error", ingredients: [], instructions: "Failed to fetch recipes." }]);
      setError("Failed to fetch AI recipes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Pantry Items</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.item} — {item.quantity} {item.unit}
            <button style={{ marginLeft: "10px" }} onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <form onSubmit={addItem} style={{ marginTop: "20px" }}>
        <input type="text" placeholder="Item name" value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
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
