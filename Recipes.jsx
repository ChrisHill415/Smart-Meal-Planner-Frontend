import React, { useState } from 'react'

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function getRecipes() {
    setLoading(true)
    setError(null)

    try {
      // Change URL below to your actual backend API endpoint
      const response = await fetch('https://smart-meal-planner-backend.onrender.com/recipes/suggest')
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      const data = await response.json()
      setRecipes(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Recipes</h2>
      <button onClick={getRecipes} disabled={loading}>
        {loading ? 'Loading...' : 'Get Recipes'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {recipes.map((recipe, idx) => (
          <li key={idx}>{recipe.title}</li>
        ))}
      </ul>
    </div>
  )
}
