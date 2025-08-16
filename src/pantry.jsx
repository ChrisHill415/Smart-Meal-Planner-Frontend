import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState(null);

  // ✅ Get auth token for RLS
  async function getToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) return null;
    return data.session.access_token;
  }

  // ✅ Fetch pantry items for current user
  async function fetchItems() {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(
        "https://smart-meal-planner-backend.onrender.com/pantry/list",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch pantry");

      console.log("Fetched pantry:", data);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Add a new pantry item
  async function addItem(e) {
    e.preventDefault();
    setError(null);
    if (!item || !quantity) return setError("Enter item and quantity.");

    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(
        "https://smart-meal-planner-backend.onrender.com/pantry/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            item: item.trim(),
            quantity: Number(quantity),
            unit: unit.trim() || "",
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add item");

      console.log("Add item response:", data);

      // ✅ Handle both array or object response
      const newItem = Array.isArray(data) ? data[0] : data;

      if (newItem) {
        setItems((prev) => [...prev, newItem]);
      } else {
        // fallback: refresh whole list
        await fetchItems();
      }

      setItem("");
      setQuantity("");
      setUnit("");
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Remove pantry item
  async function removeItem(id) {
    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(
        `https://smart-meal-planner-backend.onrender.com/pantry/remove/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to remove item");
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Load items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Pantry</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Add Item Form */}
      <form onSubmit={addItem} style={{ marginBottom: "20px" }}>
        <input
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="Item"
          style={{ marginRight: "10px" }}
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          type="number"
          style={{ marginRight: "10px" }}
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit (optional)"
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add</button>
      </form>

      {/* Pantry List */}
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.item} — {i.quantity} {i.unit}
            <button
              onClick={() => removeItem(i.id)}
              style={{ marginLeft: "10px" }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
