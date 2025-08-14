import React, { useState } from 'react'
import axios from 'axios';

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


async function handleGetRecipes() {
  const pantryList = items.map(i => i.item); // get all item names
  const recipes = await getRecipesFromOpenRouter(pantryList);
  setRecipes(recipes); // store in state to display
}
}
import axios from 'axios';

async function getRecipesFromOpenRouter(pantryItems) {
  const prompt = `I have the following ingredients: ${pantryItems.join(
    ', '
  )}. Suggest 3 easy recipes I can make with them. Include the recipe title, ingredients, and instructions.`;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/completions',
      {
        model: 'get-oss-20b',
        prompt: prompt,
        max_tokens: 800,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer YOUR_OPENROUTER_API_KEY`,
          'Content-Type': 'application/json'
        }
      }
    );

    // The model’s output is in response.data.choices[0].text
    const recipesText = response.data.choices[0].text;
    return recipesText;

  } catch (error) {
    console.error('Error fetching recipes:', error);
    return 'Failed to fetch recipes.';
  }
}


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
