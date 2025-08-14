import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import axios from 'axios';
import Recipes from './Recipes'; // <-- import the new component

export default function Pantry() {
  const [items, setItems] = useState([]);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => fetchItems(), []);

  async function fetchItems() {
    const { data, error } = await supabase.from('pantry').select('*').order('id', { ascending: true });
    if (error) setError(error.message);
    else setItems(data);
  }

  async function addItem(e) {
    e.preventDefault();
    setError(null);
    if (!item || !quantity) return setError('Enter both name and quantity.');

    const normalizedItem = item.trim().toLowerCase();

    const { data: existingItems } = await supabase.from('pantry').select('*').ilike('item', normalizedItem);

    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const newQuantity = Number(existing.quantity) + Number(quantity);
      await supabase.from('pantry').update({ quantity: newQuantity }).eq('id', existing.id);
    } else {
      await supabase.from('pantry').insert([{ item, quantity }]);
    }

    setItem('');
    setQuantity('');
    fetchItems();
  }

  async function removeItem(itemName, removeQty) {
    setError(null);

    const { data, error } = await supabase.from('pantry').select('*').ilike('item', itemName).single();
    if (error) return setError(error.message);

    const newQuantity = Number(data.quantity) - removeQty;

    if (newQuantity > 0) await supabase.from('pantry').update({ quantity: newQuantity }).eq('id', data.id);
    else await supabase.from('pantry').delete().eq('id', data.id);

    fetchItems();
  }

  async function handleGetRecipes() {
    if (items.length === 0) return setRecipes([{ title: 'Add pantry items first', ingredients: [], instructions: '' }]);

    const pantryList = items.map((i) => i.item);
    const prompt = `I have the following ingredients: ${pantryList.join(
      ', '
    )}. Suggest 3 easy recipes I can make with them. Return output as JSON array with title, ingredients, and instructions.`;

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/completions',
        {
          model: 'get-oss-20b',
          prompt,
          max_tokens: 1000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer YOUR_OPENROUTER_API_KEY`,
            'Content-Type': 'application/json',
          },
        }
      );

      const text = response.data.choices[0].text;

      try {
        setRecipes(JSON.parse(text));
      } catch {
        setRecipes([{ title: 'AI Response', ingredients: [], instructions: text }]);
      }
    } catch (err) {
      console.error(err);
      setRecipes([{ title: 'Error', ingredients: [], instructions: 'Failed to fetch recipes.' }]);
    }
  }

  // Group and sort pantry
  const groupedItems = Object.values(
    items.reduce((acc, curr) => {
      const name = curr.item.trim().toLowerCase();
      if (!acc[name]) acc[name] = { id: curr.id, name: curr.item, quantity: Number(curr.quantity) || 0 };
      else acc[name].quantity += Number(curr.quantity) || 0;
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
        <input type="text" placeholder="Item name" value={item} onChange={(e) => setItem(e.target.value)} />
        <input type="text" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        <button type="submit">Add Item</button>
      </form>

      <div style={{ marginTop: '30px' }}>
        <button onClick={handleGetRecipes}>Get Recipes</button>
      </div>

      {/* Use Recipes.jsx for display */}
      <Recipes recipes={recipes} />
    </div>
  );
}
