import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://gjxcefpcepbgjvthumpj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqeGNlZnBjZXBiZ2p2dGh1bXBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM1OTI5MzEsImV4cCI6MTk4OTE2ODkzMX0.9EZYWGLwEJHUmNwA5h75QhjDJ7BtO9pUBFLJfc1Hf7k')
