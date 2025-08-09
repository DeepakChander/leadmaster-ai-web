import { createClient } from "@supabase/supabase-js";

// Supabase client (public anon) - provided by user
// Note: In Lovable, env vars are not supported, so we use the anon key directly.
const SUPABASE_URL = "https://jakxtsvmevillzinvodl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impha3h0c3ZtZXZpbGx6aW52b2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4Mjc2OTMsImV4cCI6MjA2MTQwMzY5M30.rP2SqpkSnSGoddGO1C4Y8ug8-Dsl-6eyBqLjGTJGOVA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
});
