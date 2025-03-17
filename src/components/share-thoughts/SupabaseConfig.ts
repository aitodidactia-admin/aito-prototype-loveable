
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

// Function to save feedback for development mode without using Edge Functions
export async function saveFeedbackInDevelopment(message: string, fromWebsite: string) {
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
    return { success: true, data: newFeedback };
  } catch (err) {
    console.error("Development mode: Error saving feedback to localStorage:", err);
    return { success: false, error: err.message };
  }
}

// Function to handle feedback submission in development
export async function handleFeedbackSubmission(message: string, fromWebsite: string, isDevelopment: boolean, testMode: boolean) {
  // In development and test mode, save to localStorage
  if (isDevelopment && testMode) {
    console.log("DEV MODE: Saving feedback to localStorage");
    return await saveFeedbackInDevelopment(message, fromWebsite);
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
      
      // In dev mode, fall back to localStorage if the function call fails
      if (isDevelopment) {
        console.log("Falling back to localStorage in development mode after function failure");
        return await saveFeedbackInDevelopment(message, fromWebsite);
      }
      
      return { success: false, error: error.message };
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
    
    // In dev mode, fall back to localStorage if there's any error
    if (isDevelopment) {
      console.log("Falling back to localStorage in development mode after error");
      return await saveFeedbackInDevelopment(message, fromWebsite);
    }
    
    return { success: false, error: err.message };
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
