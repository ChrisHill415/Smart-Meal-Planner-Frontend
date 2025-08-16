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
        { headers: { Authorization: `Bearer ${token}` } }
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

  // ✅ Add new item
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
      setItems((prev) => [...prev, newItem]);

      setMessage(`✅ Added ${item}`);
      setItem("");
      setQuantity("");
      setUnit("");
    } catch (err) {
      setError(err.message);
    }
  }

  // ✅ Remove item
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

  // ✅ Update item (edit mode save)
  async function updateItem(id, updates) {
    setError(null);
    setMessage(null);

    const prevItems = [...items];
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    );

    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch(
        `https://smart-meal-planner-backend.onrender.com/pantry/update/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update item");
      }

      setMessage("✏️ Item updated");
    } catch (err) {
      setError(err.message);
      setItems(prevItems); // rollback
    }
  }

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
          <PantryItem
            key={i.id}
            item={i}
            onRemove={removeItem}
            onUpdate={updateItem}
          />
        ))}
      </ul>
    </div>
  );
}

// ✅ Pantry item with editable name, quantity, unit
function PantryItem({ item, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.item);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editUnit, setEditUnit] = useState(item.unit || "");

  const saveEdit = () => {
    if (!editName.trim() || !editQuantity) return;
    onUpdate(item.id, {
      item: editName.trim(),
      quantity: Number(editQuantity),
      unit: editUnit.trim(),
    });
    setIsEditing(false);
  };

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
      {isEditing ? (
        <span>
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            style={{ width: "100px", marginRight: "5px" }}
          />
          <input
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(e.target.value)}
            style={{ width: "60px", marginRight: "5px" }}
          />
          <input
            type="text"
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            style={{ width: "80px", marginRight: "5px" }}
            placeholder="Unit"
          />
        </span>
      ) : (
        <span>
          {item.item} — {item.quantity}
          {item.unit ? ` ${item.unit}` : ""}
        </span>
      )}

      <span>
        {isEditing ? (
          <>
            <button onClick={saveEdit} style={{ marginRight: "5px" }}>
              💾 Save
            </button>
            <button onClick={() => setIsEditing(false)}>❌ Cancel</button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              style={{ marginRight: "5px" }}
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => onRemove(item.id)}
              style={{ background: "red", color: "white", border: "none" }}
            >
              Remove
            </button>
          </>
        )}
      </span>
    </li>
  );
}
