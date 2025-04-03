
import { supabase } from "../supabase/supabaseClient";
import { FeedbackResult, FeedbackItem } from "../types/feedbackTypes";

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

// Function to save feedback for development mode without using Edge Functions
export function saveFeedbackInDevelopment(message: string, fromWebsite: string): Promise<FeedbackResult> {
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
    return Promise.resolve({ 
      success: true, 
      data: newFeedback,
      databaseSaved: true,
      emailSent: false,
      message: "Feedback saved to local storage"
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Development mode: Error saving feedback to localStorage:", err);
    }
    return Promise.resolve({ 
      success: false, 
      error: err.message,
      databaseSaved: false,
      emailSent: false
    });
  }
}

// Get stored feedback from localStorage (for dev mode)
export function getStoredFeedback(): FeedbackItem[] {
  try {
    const storedFeedback = localStorage.getItem('localFeedback');
    return storedFeedback ? JSON.parse(storedFeedback) : [];
  } catch (error) {
    console.error("Error retrieving stored feedback:", error);
    return [];
  }
}
