
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

// Enhanced function to save feedback directly to database in development mode
export async function saveFeedbackInDevelopment(message: string, fromWebsite: string) {
  try {
    console.log("Development mode: Saving feedback directly to database...");
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        message: message,
        from_website: fromWebsite,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      console.error("Development mode: Error saving feedback directly:", error);
      
      // If the error is about the table not existing, try to create it directly
      if (error.message.includes("does not exist") || error.code === "42P01") {
        console.log("Development mode: Attempting to create feedback table directly...");
        
        // Create the table directly using SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.feedback (
            id uuid primary key default gen_random_uuid(),
            message text not null,
            from_website text,
            created_at timestamp with time zone default now()
          );
        `;
        
        // Try executing the SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: createTableSQL });
        
        if (sqlError) {
          console.error("Development mode: Failed to create table via SQL RPC:", sqlError);
          return { success: false, error: "Failed to create feedback table" };
        }
        
        // Try inserting again
        const { error: retryError } = await supabase
          .from('feedback')
          .insert({
            message: message,
            from_website: fromWebsite,
            created_at: new Date().toISOString()
          });
        
        if (retryError) {
          console.error("Development mode: Error on retry save:", retryError);
          return { success: false, error: retryError.message };
        }
        
        console.log("Development mode: Successfully created table and saved feedback");
        return { success: true };
      }
      
      return { success: false, error: error.message };
    }
    
    console.log("Development mode: Feedback saved successfully:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Development mode: Unexpected error saving feedback:", err);
    return { success: false, error: err.message };
  }
}

// Function to ensure the feedback table exists
export async function ensureFeedbackTableExists() {
  try {
    // Try direct table check first in development
    if (import.meta.env.DEV) {
      console.log("Development mode: Checking if feedback table exists directly...");
      const { data, error } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log("Development mode: Feedback table exists");
        return true;
      }
      
      // If error indicates table doesn't exist, try to create it
      if (error.message.includes("does not exist") || error.code === "42P01") {
        console.log("Development mode: Attempting to create feedback table directly...");
        
        // Create the table directly using SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.feedback (
            id uuid primary key default gen_random_uuid(),
            message text not null,
            from_website text,
            created_at timestamp with time zone default now()
          );
        `;
        
        // Try executing the SQL
        const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: createTableSQL });
        
        if (sqlError) {
          console.error("Development mode: Failed to create table via SQL RPC:", sqlError);
          console.log("Falling back to Edge Function approach...");
        } else {
          console.log("Development mode: Successfully created feedback table");
          return true;
        }
      }
    }
    
    // Fall back to Edge Function approach if direct method fails or in production
    console.log("Ensuring feedback table exists through dedicated endpoint...");
    const { data, error } = await supabase.functions.invoke('create-feedback-table');
    
    if (error) {
      console.error("Error creating feedback table:", error);
      return false;
    }
    
    console.log("Feedback table creation response:", data);
    return data?.success || false;
  } catch (err) {
    console.error("Failed to ensure feedback table exists:", err);
    return false;
  }
}
