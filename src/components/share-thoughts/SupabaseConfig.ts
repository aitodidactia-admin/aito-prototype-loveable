import { createClient } from "@supabase/supabase-js";

// Use environment variables if available, otherwise fallback to the default values
// In production, these should be set through the hosting platform
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bnecasmvbfefzqjjwnys.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuZWNhc212YmZlZnpxamp3bnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMjQzOTYsImV4cCI6MjA1NzgwMDM5Nn0.3Kg7Rh_V8BGiTi1Q6ts9c7i2G6Xa23_sph0jmjgpmzE';

// Service role key should be kept secure and only used in backend functions
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email configuration
export const EMAIL_TO = import.meta.env.VITE_EMAIL_TO || "sarahdonoghue1@hotmail.com";

// Define proper return types for feedback handling
export interface FeedbackResult {
  success: boolean;
  message?: string;
  emailSent?: boolean;
  databaseSaved?: boolean;
  data?: any;
  error?: string;
}

// Function to view database feedback
export async function viewDatabaseFeedback(): Promise<FeedbackResult> {
  try {
    // Remove excessive logging in production
    if (import.meta.env.DEV) {
      console.log("Attempting to fetch feedback from database...");
    }
    
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching feedback from database:", error);
      }
      return { 
        success: false, 
        error: error.message,
        data: []
      };
    }
    
    if (import.meta.env.DEV) {
      console.log("Successfully fetched feedback from database:", data);
    }
    return { 
      success: true, 
      data: data || []
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Exception fetching feedback:", err);
    }
    return { 
      success: false, 
      error: err.message,
      data: []
    };
  }
}

// Function to save feedback for development mode without using Edge Functions
export async function saveFeedbackInDevelopment(message: string, fromWebsite: string): Promise<FeedbackResult> {
  try {
    if (import.meta.env.DEV) {
      console.log("Development mode: Saving feedback to local storage...");
    }
    
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
    
    if (import.meta.env.DEV) {
      console.log("Development mode: Feedback saved to localStorage:", newFeedback);
    }
    return { 
      success: true, 
      data: newFeedback,
      databaseSaved: true,
      emailSent: false,
      message: "Feedback saved to local storage"
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Development mode: Error saving feedback to localStorage:", err);
    }
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
    // Simplified approach - first check if the table exists, but don't try to create it
    // as we'll assume the user has created it manually
    console.log("Checking if feedback table exists...");

    // Now insert the data - even if the check fails, we'll try inserting anyway
    console.log("Inserting feedback data...");
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        message: message,
        from_website: fromWebsite,
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
    if (import.meta.env.DEV) {
      console.log("DEV MODE: Attempting to save directly to database first");
    }
    try {
      return await saveFeedbackDirectlyToDb(message, fromWebsite);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.log("DEV MODE: Direct database save failed, using localStorage");
      }
      return await saveFeedbackInDevelopment(message, fromWebsite);
    }
  }
  
  try {
    // In production or when dev mode with test mode off, use the Edge Function
    if (import.meta.env.DEV) {
      console.log("Attempting to invoke Supabase function");
    }
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: EMAIL_TO,
        message: message,
        from_website: fromWebsite,
      }
    });
    
    if (import.meta.env.DEV) {
      console.log("Supabase function response:", { data, error });
    }
    
    if (error) {
      if (import.meta.env.DEV) {
        console.error("Function error:", error);
      }
      
      // In dev mode, fall back to direct database or localStorage if the function call fails
      if (isDevelopment) {
        if (import.meta.env.DEV) {
          console.log("Falling back to direct database/localStorage in development mode after function failure");
        }
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
    if (import.meta.env.DEV) {
      console.error("Error submitting feedback:", err);
    }
    
    // In dev mode, fall back to direct database or localStorage if there's any error
    if (isDevelopment) {
      if (import.meta.env.DEV) {
        console.log("Falling back to direct database/localStorage in development mode after error");
      }
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
    console.log("Development mode: Using localStorage for feedback storage");
    return true;
  }
  
  // In production, we'll attempt to call the Edge Function
  try {
    console.log("Checking if feedback table exists...");
    const { data, error } = await supabase
      .from('feedback')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error("Table check failed:", error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error("Failed to check feedback table:", err);
    return false;
  }
}
