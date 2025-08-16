import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Get auth token for RLS
  async function getToken() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) return null;
    return data.session.access_token;
  }

  // ✅ Fetch pantry items
  async function fetchItems() {
    setLoading(true);
    setError(null);
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

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Add new pantry item
  async function addItem(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!item.trim() || !quantity) {
      return setError("Enter item and quantity.");
    }

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

      const newItem = Array.isArray(data) ? data[0] : data;

      if (newItem) {
        setItems((prev) => [...prev, newItem]);
      } else {
        await fetchItems(); // fallback
      }

      setMessage(`✅ Added ${item}`);
      setItem("");
      setQuantity("");
      setUnit("");
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Remove pantry item (optimistic UI)
  async function removeItem(id) {
    setError(null);
    setMessage(null);

    const prevItems = [...items];
    setItems((prev) => prev.filter((i) => i.id !== id));

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

      setMessage("🗑️ Item removed");
    } catch (err) {
      setError(err.message);
      setItems(prevItems); // rollback
    }
  }

  // ✅ Load on mount
  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h1>🥫 My Pantry</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
      {loading && <p>Loading pantry...</p>}

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
          style={{ marginRight: "10px", width: "80px" }}
        />
        <input
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          placeholder="Unit (optional)"
          style={{ marginRight: "10px", width: "120px" }}
        />
        <button type="submit" disabled={!item.trim() || !quantity}>
          Add
        </button>
      </form>

      {/* Pantry List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.length === 0 && !loading && <p>No items in pantry yet.</p>}
        {items.map((i) => (
          <PantryItem key={i.id} item={i} onRemove={removeItem} />
        ))}
      </ul>
    </div>
  );
}

// ✅ Small reusable component
function PantryItem({ item, onRemove }) {
  return (
    <li
      style={{
        marginBottom: "8px",
        padding: "8px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span>
        {item.item} — {item.quantity}
        {item.unit ? ` ${item.unit}` : ""}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        Remove
      </button>
    </li>
  );
}
