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

  // 🔹 Logout function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/"); // back to Home
  };

  // Fetch pantry items on mount
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const { data, error } = await supabase
        .from("pantry")
        .select("*")
        .order("id", { ascending: true });

      if (error) setError(error.message);
      else setItems(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);

    if (!item || !quantity) {
      return setError("Enter item and quantity.");
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return setError("User not logged in.");

      const { error } = await supabase.from("pantry").insert([
        {
          item: item.trim(),
          quantity: Number(quantity),
          unit: unit.trim() || "",
          user_id: user.id, // 🔹 Required for RLS
        },
      ]);

      if (error) setError(error.message);
      else {
        setItem("");
        setQuantity("");
        setUnit("");
        fetchItems();
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(itemId, removeQty) {
    setError(null);
    try {
      const { data } = await supabase
        .from("pantry")
        .select("*")
        .eq("id", itemId)
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
      setError(err.message);
    }
  }

  async function handleGetRecipes() {
    if (items.length === 0) {
      setRecipes([{ title: "Add pantry items first", instructions: "" }]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://smart-meal-planner-backend.onrender.com/api/recipes"
        );
      const aiText = await response.text();
      const splitRecipes = aiText
        .split("### Recipe:")
        .filter(Boolean)
        .map((r) => r.trim());

      const formatted = splitRecipes.map((r, idx) => ({
        title: `Recipe ${idx + 1}`,
        instructions: r.trim(),
      }));

      setRecipes(formatted);
    } catch (err) {
      setRecipes([{ title: "Error", instructions: "Failed to fetch recipes." }]);
      setError("Failed to fetch AI recipes.");
    } finally {
      setLoading(false);
    }
  }

  const groupedItems = items.map((item) => ({
    id: item.id,
    name: item.item,
    quantity: item.quantity,
    unit: item.unit,
  }));

  return (
    <div
      style={{
        width: "100vw",          // 🔹 Full width
        minHeight: "100vh",      // 🔹 Full height
        boxSizing: "border-box",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* 🔹 Top bar with Logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          width: "100%",
        }}
      >
        <h2>Pantry Items</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 15px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "#e53935",
            color: "white",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul style={{ width: "100%", padding: 0 }}>
        {groupedItems.map((item) => (
          <li key={item.id} style={{ marginBottom: "10px" }}>
            {item.name} — {item.quantity} {item.unit}{" "}
            <select
              onChange={(e) => {
                const qty = Number(e.target.value);
                if (qty === 0) return;
                removeItem(item.id, qty);
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

      <form onSubmit={addItem} style={{ marginTop: "20px", width: "100%" }}>
        <input
          type="text"
          placeholder="Item name"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="Unit (optional)"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add Item</button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleGetRecipes} disabled={loading}>
          {loading ? "Fetching Recipes..." : "Get Recipes"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          marginTop: "20px",
          width: "100%",     // 🔹 Full width container
        }}
      >
        {recipes.map((r, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#333",
              color: "#fff",
              border: "1px solid #555",
              padding: "15px",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              flex: "1 1 300px",
              minWidth: "250px",
            }}
          >
            <h3>{r.title}</h3>
            <p>{r.instructions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
