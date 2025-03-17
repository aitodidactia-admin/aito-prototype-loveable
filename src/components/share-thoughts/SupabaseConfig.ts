
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

// Define proper return types for feedback handling
export interface FeedbackResult {
  success: boolean;
  message?: string;
  emailSent?: boolean;
  databaseSaved?: boolean;
  data?: any;
  error?: string;
}

// Function to save feedback for development mode without using Edge Functions
export async function saveFeedbackInDevelopment(message: string, fromWebsite: string): Promise<FeedbackResult> {
  try {
    console.log("Development mode: Saving feedback to local storage...");
    
    // First create an array to store the feedback if it doesn't exist
    const existingFeedback = localStorage.getItem('localFeedback');
    const feedbackArray = existingFeedback ? JSON.parse(existingFeedback) : [];
    
    // Add the new feedback
    const newFeedback = {
      id: crypto.randomUUID(),
      message: message,
      from_website: fromWebsite,
      created_at: new Date().toISOString()
    };
    
    feedbackArray.push(newFeedback);
    
    // Save back to localStorage
    localStorage.setItem('localFeedback', JSON.stringify(feedbackArray));
    
    console.log("Development mode: Feedback saved to localStorage:", newFeedback);
    return { 
      success: true, 
      data: newFeedback,
      databaseSaved: true,
      emailSent: false,
      message: "Feedback saved to local storage"
    };
  } catch (err) {
    console.error("Development mode: Error saving feedback to localStorage:", err);
    return { 
      success: false, 
      error: err.message,
      databaseSaved: false,
      emailSent: false
    };
  }
}

// Function to directly save to the database in development (bypassing Edge Functions)
export async function saveFeedbackDirectlyToDb(message: string, fromWebsite: string): Promise<FeedbackResult> {
  console.log("Attempting to save feedback directly to Supabase...");
  
  try {
    // First try to ensure the table exists
    console.log("Checking if feedback table exists...");
    
    try {
      // Try to query the table to see if it exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('feedback')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.log("Table check failed, attempting to create table:", tableError);
        
        // Try to create the table using SQL
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.feedback (
            id uuid primary key default gen_random_uuid(),
            message text not null,
            from_website text,
            created_at timestamp with time zone default now()
          );
        `;
        
        // Execute the SQL using the REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceRoleKey}`,
            'apikey': supabaseAnonKey
          },
          body: JSON.stringify({
            query: createTableSQL
          })
        });
        
        if (!response.ok) {
          console.error("Failed to create table:", await response.text());
          throw new Error("Failed to create feedback table");
        }
      }
    } catch (tableCreateError) {
      console.error("Error creating table:", tableCreateError);
      // Continue anyway and try to insert - the table might actually exist
    }
    
    // Now insert the data
    console.log("Inserting feedback data...");
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        message: message,
        from_website: fromWebsite,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error("Error inserting feedback:", error);
      
      // Fall back to localStorage if database insert fails
      console.log("Falling back to localStorage after database failure");
      return await saveFeedbackInDevelopment(message, fromWebsite);
    }
    
    console.log("Feedback saved successfully to database:", data);
    return {
      success: true,
      databaseSaved: true,
      emailSent: false,
      message: "Feedback saved to database",
      data: data
    };
  } catch (err) {
    console.error("Error saving feedback directly:", err);
    
    // Fall back to localStorage as a last resort
    console.log("Falling back to localStorage after error");
    return await saveFeedbackInDevelopment(message, fromWebsite);
  }
}

// Function to handle feedback submission in development
export async function handleFeedbackSubmission(message: string, fromWebsite: string, isDevelopment: boolean, testMode: boolean): Promise<FeedbackResult> {
  // In development and test mode, first try database then fall back to localStorage
  if (isDevelopment && testMode) {
    console.log("DEV MODE: Attempting to save directly to database first");
    try {
      return await saveFeedbackDirectlyToDb(message, fromWebsite);
    } catch (err) {
      console.log("DEV MODE: Direct database save failed, using localStorage");
      return await saveFeedbackInDevelopment(message, fromWebsite);
    }
  }
  
  try {
    // In production or when dev mode with test mode off, use the Edge Function
    console.log("Attempting to invoke Supabase function");
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: EMAIL_TO,
        message: message,
        from_website: fromWebsite,
      }
    });
    
    console.log("Supabase function response:", { data, error });
    
    if (error) {
      console.error("Function error:", error);
      
      // In dev mode, fall back to direct database or localStorage if the function call fails
      if (isDevelopment) {
        console.log("Falling back to direct database/localStorage in development mode after function failure");
        return await saveFeedbackDirectlyToDb(message, fromWebsite);
      }
      
      return { 
        success: false, 
        error: error.message,
        databaseSaved: false,
        emailSent: false
      };
    }
    
    // Handle the function response
    return { 
      success: data?.success || false, 
      emailSent: data?.emailSent || false,
      databaseSaved: data?.databaseSaved || false,
      message: data?.message || "Unknown status"
    };
  } catch (err) {
    console.error("Error submitting feedback:", err);
    
    // In dev mode, fall back to direct database or localStorage if there's any error
    if (isDevelopment) {
      console.log("Falling back to direct database/localStorage in development mode after error");
      return await saveFeedbackDirectlyToDb(message, fromWebsite);
    }
    
    return { 
      success: false, 
      error: err.message,
      databaseSaved: false,
      emailSent: false
    };
  }
}

// Get stored feedback from localStorage (for dev mode)
export function getStoredFeedback() {
  try {
    const storedFeedback = localStorage.getItem('localFeedback');
    return storedFeedback ? JSON.parse(storedFeedback) : [];
  } catch (error) {
    console.error("Error retrieving stored feedback:", error);
    return [];
  }
}

// For development purposes only - check if feedback table exists
export async function ensureFeedbackTableExists() {
  // For development, we'll just simulate this by checking localStorage
  if (import.meta.env.DEV) {
    console.log("Development mode: Using localStorage for feedback - no table needed");
    return true;
  }
  
  // In production, we'll attempt to call the Edge Function
  try {
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
