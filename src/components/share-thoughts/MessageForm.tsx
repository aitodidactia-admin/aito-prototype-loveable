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
import MessagePreview from "./MessagePreview";
import { useConsoleLogger } from "./useConsoleLogger";
import ConsoleLogViewer from "./ConsoleLogViewer";

interface MessageFormProps {
  testMode: boolean;
  isDevelopment: boolean;
}

const MessageForm = ({ testMode, isDevelopment }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTableReady, setIsTableReady] = useState(false);
  const [tableCheckComplete, setTableCheckComplete] = useState(false);
  const [storedFeedback, setStoredFeedback] = useState<any[]>([]);
  const [databaseFeedback, setDatabaseFeedback] = useState<any[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
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

  useEffect(() => {
    const loadFeedback = async () => {
      setIsLoadingFeedback(true);
      const localFeedback = getStoredFeedback();
      setStoredFeedback(localFeedback);
      
      try {
        const dbFeedback = await viewDatabaseFeedback();
        if (dbFeedback.success && dbFeedback.data) {
          setDatabaseFeedback(dbFeedback.data);
        }
      } catch (error) {
        console.error("Error loading database feedback:", error);
      }
      
      setIsLoadingFeedback(false);
    };
    
    loadFeedback();
  }, [isSubmitSuccess]);

  const formatEmailHtml = () => {
    return `
      <h2>New Feedback from Aito user</h2>
      <p><strong>From:</strong> ${window.location.origin}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `;
  };

  const handlePreview = () => {
    setIsPreviewMode(true);
    
    if (import.meta.env.DEV) {
      console.log("Email Preview:");
      console.log(`To: ${EMAIL_TO}`);
      console.log(`From: sarahdonoghue1@hotmail.com`);
      console.log(`Subject: New Feedback from Aito user`);
      console.log("HTML Content:");
      console.log(formatEmailHtml());
    }
  };

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
      
      console.log("Feedback submission result:", result);
      
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
    setIsPreviewMode(false);
  };

  const renderFeedbackViewer = () => {
    return (
      <div className="mt-6 space-y-4">
        {isLoadingFeedback ? (
          <p className="text-center text-muted-foreground">Loading stored feedback...</p>
        ) : (
          <>
            {databaseFeedback.length > 0 && (
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Supabase Database Feedback</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {databaseFeedback.map((item: any, index: number) => (
                    <div key={`db-${index}`} className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                      <p className="mt-1">{item.message}</p>
                      <p className="mt-1 text-sm text-gray-500">From: {item.from_website}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {storedFeedback.length > 0 && (
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium text-gray-900 mb-2">Local Storage Feedback</h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {storedFeedback.map((item: any, index: number) => (
                    <div key={`local-${index}`} className="p-3 bg-white rounded border">
                      <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                      <p className="mt-1">{item.message}</p>
                      <p className="mt-1 text-sm text-gray-500">From: {item.from_website}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {storedFeedback.length === 0 && databaseFeedback.length === 0 && (
              <p className="text-center text-muted-foreground">No feedback has been stored yet.</p>
            )}
          </>
        )}
      </div>
    );
  };

  if (isSubmitSuccess) {
    return (
      <div className="space-y-4">
        <SuccessFeedback recipient={EMAIL_TO} onReset={handleReset} />
        {renderFeedbackViewer()}
      </div>
    );
  }

  if (isPreviewMode) {
    return (
      <MessagePreview
        emailTo={EMAIL_TO}
        message={message}
        onSend={handleSubmit}
        onBack={() => setIsPreviewMode(false)}
        isLoading={isLoading}
        formatEmailHtml={formatEmailHtml}
        consoleOutput={consoleOutput}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MessageInputForm
        message={message}
        setMessage={setMessage}
        onSubmit={handleSubmit}
        onPreview={handlePreview}
        isLoading={isLoading}
        consoleOutput={consoleOutput}
      />
      
      {isDevelopment && renderFeedbackViewer()}
    </div>
  );
};

export default MessageForm;
