
// Define proper return types for feedback handling
export interface FeedbackResult {
  success: boolean;
  message?: string;
  emailSent?: boolean;
  databaseSaved?: boolean;
  data?: any;
  error?: string;
}

export interface FeedbackItem {
  id: string;
  message: string;
  from_website: string;
  created_at: string;
}
