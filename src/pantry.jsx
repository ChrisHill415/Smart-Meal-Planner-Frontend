import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  useEffect(() => { fetchItems(); }, []);

  async function fetchItems() {
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch("https://smart-meal-planner-backend.onrender.com/pantry/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch pantry");
      setItems(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);
    if (!item || !quantity) return setError("Enter item and quantity.");

    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch("https://smart-meal-planner-backend.onrender.com/pantry/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          item: item.trim(),
          quantity: Number(quantity),
          unit: unit.trim() || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to add item");

      // Insert the newly added item into local state
      setItems((prev) => [...prev, data[0] || data]);
      setItem("");
      setQuantity("");
      setUnit("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeQuantity(itemId, removeQty) {
    if (removeQty <= 0) return;
    setError(null);

    const itemIndex = items.findIndex((i) => i.id === itemId);
    if (itemIndex === -1) return;
    const currentQty = items[itemIndex].quantity;
    const newQty = currentQty - removeQty;

    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      let res, data;
      if (newQty > 0) {
        res = await fetch(`https://smart-meal-planner-backend.onrender.com/pantry/update/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ quantity: newQty }),
        });
        data = await res.json();
      } else {
        res = await fetch(`https://smart-meal-planner-backend.onrender.com/pantry/remove/${itemId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data.detail || "Failed to update/remove item");

      setItems((prev) => {
        const updated = [...prev];
        if (newQty > 0 && data.item) updated[itemIndex] = data.item;
        else updated.splice(itemIndex, 1);
        return updated;
      });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGetRecipes() {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error("Not logged in");

      const res = await fetch("https://smart-meal-planner-backend.onrender.com/api/recipes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch recipes");

      const splitRecipes = data.recipes
        .split("### Recipe:")
        .filter(Boolean)
        .map((r) => r.trim());

      setRecipes(splitRecipes.map((r, idx) => ({ title: `Recipe ${idx + 1}`, instructions: r })));
    } catch (err) {
      setRecipes([{ title: "Error", instructions: "Failed to fetch recipes." }]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2>Pantry Items</h2>
        <button onClick={handleLogout} style={{ padding: "8px 15px", borderRadius: "5px", border: "none", backgroundColor: "#e53935", color: "white", cursor: "pointer" }}>Logout</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.item} — {item.quantity} {item.unit}
            <select
              onChange={(e) => removeQuantity(item.id, Number(e.target.value))}
              style={{ marginLeft: "10px" }}
            >
              <option value={0}>Remove...</option>
              {Array.from({ length: item.quantity }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>

      <form onSubmit={addItem} style={{ marginTop: "20px" }}>
        <input type="text" placeholder="Item name" value={item} onChange={(e) => setItem(e.target.value)} style={{ marginRight: "10px" }} />
        <input type="text" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ marginRight: "10px" }} />
        <input type="text" placeholder="Unit (optional)" value={unit} onChange={(e) => setUnit(e.target.value)} style={{ marginRight: "10px" }} />
        <button type="submit">Add Item</button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleGetRecipes} disabled={loading}>
          {loading ? "Fetching Recipes..." : "Get Recipes"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "20px" }}>
        {recipes.map((r, idx) => (
          <div key={idx} style={{ backgroundColor: "#333", color: "#fff", border: "1px solid #555", padding: "15px", borderRadius: "8px", whiteSpace: "pre-wrap", flex: "1 1 300px", minWidth: "250px" }}>
            <h3>{r.title}</h3>
            <p>{r.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
