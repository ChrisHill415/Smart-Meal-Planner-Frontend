import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import axios from 'axios';

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);

  // Fetch pantry items on load
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase
      .from('pantry')
      .select('*')
      .order('id', { ascending: true });

    if (error) setError(error.message);
    else setItems(data);
  }

  // Add items (merge duplicates)
  async function addItem(e) {
    e.preventDefault();
    setError(null);
    if (!item || !quantity) {
      setError('Please enter both name and quantity.');
      return;
    }

    const normalizedItem = item.trim().toLowerCase();

    // Check if item exists
    const { data: existingItems, error: fetchError } = await supabase
      .from('pantry')
      .select('*')
      .ilike('item', normalizedItem);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const newQuantity = Number(existing.quantity) + Number(quantity);

      const { error: updateError } = await supabase
        .from('pantry')
        .update({ quantity: newQuantity })
        .eq('id', existing.id);

      if (updateError) setError(updateError.message);
    } else {
      const { error: insertError } = await supabase
        .from('pantry')
        .insert([{ item, quantity }]);

      if (insertError) setError(insertError.message);
    }

    setItem('');
    setQuantity('');
    fetchItems();
  }

  // Remove items with dropdown
  async function removeItem(itemName, removeQty) {
    setError(null);

    const { data, error } = await supabase
      .from('pantry')
      .select('*')
      .ilike('item', itemName)
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    const newQuantity = Number(data.quantity) - removeQty;

    if (newQuantity > 0) {
      await supabase
        .from('pantry')
        .update({ quantity: newQuantity })
        .eq('id', data.id);
    } else {
      await supabase.from('pantry').delete().eq('id', data.id);
    }

    fetchItems();
  }

  // Get recipes from OpenRouter get-oss-20b
  async function handleGetRecipes() {
    if (items.length === 0) {
      setRecipes('Add some pantry items first!');
      return;
    }

    const pantryList = items.map((i) => i.item);
    const prompt = `I have the following ingredients: ${pantryList.join(
      ', '
    )}. Suggest 3 easy recipes I can make with them. Return output as JSON array with title, ingredients, and instructions.`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/completions',
        {
          model: 'get-oss-20b',
          prompt: prompt,
          max_tokens: 1000,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENROUTER_API_KEY`,
            'Content-Type': 'application/json'
          }
        }
      );

      const text = response.data.choices[0].text;

      // Try to parse JSON
      try {
        const parsed = JSON.parse(text);
        setRecipes(parsed);
      } catch (err) {
        setRecipes([{ title: 'AI Response', ingredients: [], instructions: text }]);
      }

    } catch (err) {
      console.error(err);
      setRecipes([{ title: 'Error', ingredients: [], instructions: 'Failed to fetch recipes.' }]);
    }
  }

  // Group and sort pantry items
  const groupedItems = Object.values(
    items.reduce((acc, curr) => {
      const name = curr.item.trim().toLowerCase();
      if (!acc[name]) {
        acc[name] = {
          id: curr.id,
          name: curr.item,
          quantity: Number(curr.quantity) || 0
        };
      } else {
        acc[name].quantity += Number(curr.quantity) || 0;
      }
      return acc;
    }, {})
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <h2>Pantry Items</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {groupedItems.map((item) => (
          <li key={item.id}>
            {item.name} — {item.quantity}{' '}
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

      <form onSubmit={addItem} style={{ marginTop: '20px' }}>
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
        <button type="submit">Add Item</button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <button onClick={handleGetRecipes}>Get Recipes</button>
      </div>

      {recipes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Suggested Recipes:</h3>
          {recipes.map((r, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
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
      )}
    </div>
  );
}
