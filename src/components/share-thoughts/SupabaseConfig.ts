
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
export const supabaseUrl = 'https://bnecasmvbfefzqjjwnys.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjQzOTYsImV4cCI6MjA1NzgwMDM5Nn0.3Kg7Rh_V8BGiTi1Q6ts9c7i2G6Xa23_sph0jmjgpmzE';

// Also define the service role key for Edge Functions
export const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MjIyNDM5NiwiZXhwIjoyMDU3ODAwMzk2fQ.RB9OzU3kNhU0ROJo5QMaWJVOy83VMCQT9Tva1c1jz5I';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email configuration
export const EMAIL_TO = "sarahdonoghue1@hotmail.com";
