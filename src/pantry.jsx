import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import axios from "axios";
import Recipes from "./Recipes";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState(""); // optional
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from("pantry")
      .select("*")
      .order("id", { ascending: true });
    if (error) setError(error.message);
    else setItems(data || []);
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);

    if (!item || !quantity) {
      return setError("Enter item and quantity.");
    }

    const payload = {
      item: item.trim(),
      quantity: Number(quantity),
      unit: unit.trim() || "", // keep empty string if not provided
    };

    try {
      await axios.post(
        "https://smart-meal-planner-backend.onrender.com/pantry/add",
        payload
      );
      setItem("");
      setQuantity("");
      setUnit("");
      fetchItems();
    } catch (err) {
      console.error("Failed to add item:", err);
      setError("Failed to add item. Check console for details.");
    }
  }

  async function removeItem(itemName, removeQty) {
    setError(null);
    try {
      const { data } = await supabase
        .from("pantry")
        .select("*")
        .ilike("item", itemName)
        .single();

      const newQuantity = Number(data.quantity) - removeQty;

      if (newQuantity > 0) {
        await supabase
          .from("pantry")
          .update({ quantity: newQuantity })
          .eq("id", data.id);
      } else {
        await supabase.from("pantry").delete().eq("id", data.id);
      }

      fetchItems();
    } catch (err) {
      console.error("Failed to remove item:", err);
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
      const response = await axios.get(
        "https://smart-meal-planner-backend.onrender.com/recipes/suggest"
      );
      const aiRecipes = response.data;

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

  const groupedItems = Object.values(
    items.reduce((acc, curr) => {
      const name = curr.item.trim().toLowerCase();
      if (!acc[name]) acc[name] = { id: curr.id, name: curr.item, quantity: Number(curr.quantity) || 0, unit: curr.unit || "" };
      else acc[name].quantity += Number(curr.quantity) || 0;
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
            {item.name} — {item.quantity} {item.unit}{" "}
            <select
              onChange={(e) => {
                const qty = Number(e.target.value);
                if (qty === 0) return;
                removeItem(item.name, qty);
              }}
            >
              <option value={0}>Remove...</option>
              {Array.from({ length: item.quantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
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
          type="text"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="text"
          placeholder="Unit (optional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
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
