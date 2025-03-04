import { createClient } from "@supabase/supabase-js";

// Define your Supabase URL and Key
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SERVICE_KEY;

// Create a Supabase client instance
const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_KEY ?? "");

export { supabase };
