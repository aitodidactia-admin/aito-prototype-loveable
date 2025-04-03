
// This file now serves as the main entry point for Supabase configuration
// and re-exports everything needed from the modularized structure

// Re-export client and constants
export { 
  supabase, 
  supabaseUrl, 
  supabaseAnonKey, 
  supabaseServiceRoleKey,
  EMAIL_TO
} from './supabase/supabaseClient';

// Re-export types
export type { 
  FeedbackResult,
  FeedbackItem
} from './types/feedbackTypes';

// Re-export database services
export { 
  viewDatabaseFeedback,
  saveFeedbackDirectlyToDb,
  saveFeedbackInDevelopment,
  ensureFeedbackTableExists,
  getStoredFeedback
} from './services/databaseService';

// Re-export feedback services
export { 
  handleFeedbackSubmission 
} from './services/feedbackService';
