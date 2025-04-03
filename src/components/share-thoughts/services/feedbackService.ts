
import { FeedbackResult } from "../types/feedbackTypes";
import { EMAIL_TO } from "../MessageForm";

// Function to save feedback in development mode using localStorage
function saveFeedbackInDevelopment(message: string, fromWebsite: string): Promise<FeedbackResult> {
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

// Function to handle feedback submission
export async function handleFeedbackSubmission(
  message: string, 
  fromWebsite: string, 
  isDevelopment: boolean, 
  testMode: boolean
): Promise<FeedbackResult> {
  // In development mode or test mode, use localStorage
  if (isDevelopment || testMode) {
    if (import.meta.env.DEV) {
      console.log("DEV MODE: Using localStorage for feedback");
    }
    return await saveFeedbackInDevelopment(message, fromWebsite);
  }
  
  try {
    // In production, use the Netlify function
    if (import.meta.env.DEV) {
      console.log("Attempting to invoke Netlify function");
    }
    
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: EMAIL_TO,
        message: message,
        from_website: fromWebsite,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Function error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    
    if (import.meta.env.DEV) {
      console.log("Netlify function response:", data);
    }
    
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
    
    // In dev mode, fall back to localStorage if there's any error
    if (isDevelopment) {
      if (import.meta.env.DEV) {
        console.log("Falling back to localStorage in development mode after error");
      }
      return await saveFeedbackInDevelopment(message, fromWebsite);
    }
    
    return { 
      success: false, 
      error: err.message,
      databaseSaved: false,
      emailSent: false
    };
  }
}
