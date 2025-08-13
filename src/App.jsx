import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './login'
import Pantry from './pantry'
import Recipes from './Recipes'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const session = supabase.auth.getSession().then(({ data }) => {
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
    // Show login if no user
    return <Login />
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <Pantry />
      <Recipes />
      {/* You can add a logout button too */}
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  )
}
