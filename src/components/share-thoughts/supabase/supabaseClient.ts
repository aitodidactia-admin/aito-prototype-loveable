
import { createClient } from "@supabase/supabase-js";

// Use environment variables if available, otherwise fallback to the default values
// In production, these should be set through the hosting platform
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnecasmvbfefzqjjwnys.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjQzOTYsImV4cCI6MjA1NzgwMDM5Nn0.3Kg7Rh_V8BGiTi1Q6ts9c7i2G6Xa23_sph0jmjgpmzE';

// Service role key should be kept secure and only used in backend functions
// In browser environments, we don't have access to Node.js process.env
export const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email configuration
export const EMAIL_TO = import.meta.env.VITE_EMAIL_TO || "sarahdonoghue1@hotmail.com";
