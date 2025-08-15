import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Home from "./home";
import Pantry from "./pantry";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogin(false);
  };

  // If logged in
  if (user) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Welcome, {user.email}</h1>
        <Pantry />
        <button onClick={handleLogout} style={{ marginTop: "20px", padding: "10px 20px" }}>
          Logout
        </button>
      </div>
    );
  }

  // If showing login (could also use Supabase OTP / OAuth)
  if (showLogin) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Login / Signup</h1>
        <button
          style={{ padding: "10px 20px", marginTop: "20px" }}
          onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
        >
          Continue with Google
        </button>
        <br />
        <button style={{ marginTop: "20px" }} onClick={() => setShowLogin(false)}>
          Back
        </button>
      </div>
    );
  }

  // Default Home page
  return <Home onGetStarted={() => setShowLogin(true)} />;
}
