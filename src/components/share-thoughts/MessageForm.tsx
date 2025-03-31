
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  EMAIL_TO, 
  ensureFeedbackTableExists, 
  handleFeedbackSubmission,
  getStoredFeedback,
  FeedbackResult,
  viewDatabaseFeedback
} from "./SupabaseConfig";
import SuccessFeedback from "./SuccessFeedback";
import MessageInputForm from "./MessageInputForm";
import { useConsoleLogger } from "./useConsoleLogger";

interface MessageFormProps {
  testMode: boolean;
  isDevelopment: boolean;
}

const MessageForm = ({ testMode, isDevelopment }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isTableReady, setIsTableReady] = useState(false);
  const [tableCheckComplete, setTableCheckComplete] = useState(false);
  const consoleOutput = useConsoleLogger();

  useEffect(() => {
    const checkTable = async () => {
      if (import.meta.env.DEV) {
        console.log("Checking if feedback storage is ready...");
      }
      
      if (isDevelopment) {
        if (import.meta.env.DEV) {
          console.log("Development mode: Using localStorage for feedback storage");
        }
        setIsTableReady(true);
        setTableCheckComplete(true);
        return;
      }
      
      const success = await ensureFeedbackTableExists();
      setIsTableReady(success);
      setTableCheckComplete(true);
      
      if (success) {
        if (import.meta.env.DEV) {
          console.log("Feedback table is ready for use");
        }
      } else {
        if (import.meta.env.DEV) {
          console.warn("Warning: Feedback table may not be properly set up");
        }
        
        // Only show toast in development mode to avoid alarming end users
        if (isDevelopment) {
          toast({
            title: "Database Setup",
            description: "The feedback table might not be properly set up. Using local storage fallback instead.",
            variant: "destructive",
          });
        }
      }
    };
    
    checkTable();
  }, [isDevelopment, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result: FeedbackResult = await handleFeedbackSubmission(
        message,
        window.location.origin,
        isDevelopment,
        testMode
      );
      
      if (result.success) {
        let successMessage = "Your feedback has been saved";
        
        if (isDevelopment && testMode) {
          successMessage += " to local storage. Check browser dev tools for details.";
          if (result.databaseSaved) {
            successMessage = "Your feedback has been saved to the database successfully.";
          }
        } else if (result.emailSent) {
          successMessage += ` and an email has been sent to ${EMAIL_TO}`;
        } else if (result.databaseSaved) {
          successMessage += " to the database. Email notification is currently disabled.";
        }
        
        toast({
          title: "Success",
          description: successMessage,
        });
        setIsSubmitSuccess(true);
      } else {
        throw new Error(result.error || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast({
        title: "Error",
        description: isDevelopment
          ? `Failed to send your message. Error: ${error.message}`
          : "Failed to send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessage("");
    setIsSubmitSuccess(false);
  };

  if (isSubmitSuccess) {
    return (
      <div className="space-y-4">
        <SuccessFeedback recipient={EMAIL_TO} onReset={handleReset} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MessageInputForm
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default MessageForm;
