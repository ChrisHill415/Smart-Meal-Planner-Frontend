import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fqqpgfxufljvxgithyvb.supabase.co'       // Replace with your actual Supabase project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxcXBnZnh1ZmxqdnhnaXRoeXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NzI2OTMsImV4cCI6MjA3MDQ0ODY5M30.ccY6m60xtFSTHgD4iov7y21S3Kbh42TOZgPkSghtBF0' // Replace with your anon/public API key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
