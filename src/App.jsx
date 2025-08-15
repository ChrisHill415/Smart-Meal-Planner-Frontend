import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './login'
import Pantry from './pantry'
import Recipes from './Recipes'
import Home from "./home";

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    // Listen for auth state changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  if (!user) {
    // Show login page or homepage if not logged in
    return <Home />
  }

  // Show main app if logged in
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, {user.email}</h1>
      <Pantry />
      <Recipes />
      <button
        onClick={() => supabase.auth.signOut()}
        style={{ marginTop: "20px" }}
      >
        Logout
      </button>
    </div>
  )
}
