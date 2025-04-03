
import { supabase } from "../supabase/supabaseClient";
import { FeedbackResult } from "../types/feedbackTypes";
import { EMAIL_TO } from "../supabase/supabaseClient";
import { saveFeedbackDirectlyToDb, saveFeedbackInDevelopment } from "./databaseService";

// Function to handle feedback submission in development
export async function handleFeedbackSubmission(
  message: string, 
  fromWebsite: string, 
  isDevelopment: boolean, 
  testMode: boolean
): Promise<FeedbackResult> {
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
