import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function Pantry() {
  const [items, setItems] = useState([])
  const [item, setItem] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState(null)

  // Fetch pantry items from Supabase on component load
  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    let { data, error } = await supabase
      .from('pantry')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setItems(data)
    }
  }

async function addItem(e) {
  e.preventDefault();
  setError(null);

  if (!item || !quantity) {
    setError('Please enter both name and quantity.');
    return;
  }

  const normalizedItem = item.trim().toLowerCase();

  // 1. Check if the item already exists
  const { data: existingItems, error: fetchError } = await supabase
    .from('pantry')
    .select('*')
    .ilike('item', normalizedItem); // case-insensitive search

  if (fetchError) {
    setError(fetchError.message);
    return;
  }

  if (existingItems.length > 0) {
    // 2. If exists, update quantity
    const existing = existingItems[0];
    const newQuantity = Number(existing.quantity) + Number(quantity);

    const { error: updateError } = await supabase
      .from('pantry')
      .update({ quantity: newQuantity })
      .eq('id', existing.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
  } else {
    // 3. If not exists, insert new
    const { error: insertError } = await supabase
      .from('pantry')
      .insert([{ item, quantity }]);

    if (insertError) {
      setError(insertError.message);
      return;
    }
  }

  // 4. Reset form and refresh
  setItem('');
  setQuantity('');
  fetchItems();
}

async function removeItem(item) {
  setError(null);

  // Ask the user how much to remove
  const input = prompt(`Enter quantity of "${item.item}" to remove:`);

  if (input === null) return; // user canceled

  const removeQty = Number(input);

  if (isNaN(removeQty) || removeQty <= 0) {
    alert('Please enter a valid number greater than 0.');
    return;
  }

  const newQuantity = Number(item.quantity) - removeQty;

  if (newQuantity > 0) {
    // Update quantity
    const { error } = await supabase
      .from('pantry')
      .update({ quantity: newQuantity })
      .eq('id', item.id);

    if (error) setError(error.message);
  } else {
    // Remove entire row
    const { error } = await supabase
      .from('pantry')
      .delete()
      .eq('id', item.id);

    if (error) setError(error.message);
  }

  fetchItems(); // refresh list
}




return (
  <div>
    <h2>Pantry Items</h2>
    {error && <p style={{ color: 'red' }}>{error}</p>}
    <ul>
      {Object.values(
        items.reduce((acc, curr) => {
          const name = curr.item.trim().toLowerCase(); // normalize case
          if (!acc[name]) {
            acc[name] = {
              id: curr.id,          // store id for remove
              name: curr.item,      // original name
              quantity: Number(curr.quantity) || 0,
            };
          } else {
            acc[name].quantity += Number(curr.quantity) || 0;
          }
          return acc;
        }, {})
      )
      .sort((a, b) => a.name.localeCompare(b.name)) // alphabetical
      .map(grouped => (
        <li key={grouped.id}>
          {grouped.name} — {grouped.quantity}
          <button
            onClick={() => removeItem(grouped)}
            style={{ marginLeft: '10px', color: 'red' }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>

    <form onSubmit={addItem}>
      <input
        type="text"
        placeholder="Item name"
        value={item}
        onChange={e => setItem(e.target.value)}
      />
      <input
        type="text"
        placeholder="Quantity"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />
      <button type="submit">Add Item</button>
    </form>
  </div>
);

}
