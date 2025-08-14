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
    e.preventDefault()
    setError(null)

    if (!item || !quantity) {
      setError('Please enter both name and quantity.')
      return
    }

    const { data, error } = await supabase
      .from('pantry')
      .insert([{ item, quantity }])

    if (error) {
      setError(error.message)
    } else {
      setItem('')
      setQuantity('')
      fetchItems() // refresh list
    }
  }

  return (
    <div>
      <h2>Pantry Items</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map(pantryItem => (
          <li key={pantryItem.id}>
            {pantryItem.item} — {pantryItem.quantity}
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
  )
}
