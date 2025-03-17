
import { createClient } from "@supabase/supabase-js";

// Supabase configuration
export const supabaseUrl = 'https://bnecasmvbfefzqjjwnys.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjQzOTYsImV4cCI6MjA1NzgwMDM5Nn0.3Kg7Rh_V8BGiTi1Q6ts9c7i2G6Xa23_sph0jmjgpmzE';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email configuration
export const EMAIL_TO = "sarahdonoghue1@hotmail.com";
