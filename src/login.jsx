import React, { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  async function handleLogin() {
    const { user, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else console.log('Logged in user:', user)
  }

  async function handleSignUp() {
    const { user, error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else console.log('Signed up user:', user)
  }

  return (
    <div>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <button onClick={handleSignUp}>Sign Up</button>
      {error && <p>{error}</p>}
    </div>
  )
}
