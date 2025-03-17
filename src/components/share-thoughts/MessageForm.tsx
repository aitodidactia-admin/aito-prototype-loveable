
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, EMAIL_TO, ensureFeedbackTableExists } from "./SupabaseConfig";
import SuccessFeedback from "./SuccessFeedback";
import MessageInputForm from "./MessageInputForm";
import MessagePreview from "./MessagePreview";
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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isTableReady, setIsTableReady] = useState(false);
  const [tableCheckComplete, setTableCheckComplete] = useState(false);
  const consoleOutput = useConsoleLogger();

  // Ensure the feedback table exists when the component mounts
  useEffect(() => {
    const checkTable = async () => {
      console.log("Checking if feedback table exists...");
      const success = await ensureFeedbackTableExists();
      setIsTableReady(success);
      setTableCheckComplete(true);
      
      if (success) {
        console.log("Feedback table is ready for use");
      } else {
        console.warn("Warning: Feedback table may not be properly set up");
        
        // Only show toast in development mode to avoid alarming end users
        if (isDevelopment) {
          toast({
            title: "Database Setup",
            description: "The feedback table might not be properly set up. Check console for details.",
            variant: "destructive",
          });
        }
      }
    };
    
    checkTable();
  }, [isDevelopment, toast]);

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
    
    // Log the email content that would be sent
    console.log("Email Preview:");
    console.log(`To: ${EMAIL_TO}`);
    console.log(`From: sarahdonoghue1@hotmail.com`);
    console.log(`Subject: New Feedback from Aito user`);
    console.log("HTML Content:");
    console.log(formatEmailHtml());
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
      if (isDevelopment && testMode) {
        // Simulate successful response in development
        console.log("DEV MODE: Would send email with:", {
          to: EMAIL_TO,
          message: message,
          from_website: window.location.origin,
        });
        
        console.log("DEV MODE: Would save feedback to database");
        
        // Artificial delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Test Mode: Message Simulated",
          description: `In production, this would send an email to ${EMAIL_TO} and save to the database. Check console for details.`,
        });
        setIsSubmitSuccess(true);
      } else {
        // Call Supabase Edge Function to send email and save to database
        console.log("Attempting to invoke Supabase function");
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: EMAIL_TO,
            message: message,
            from_website: window.location.origin,
          }
        });
        
        console.log("Supabase function response:", { data, error });
        
        if (error) {
          console.error("Function error:", error);
          throw error;
        }
        
        // Handle the possible outcomes
        if (data && data.success) {
          let successMessage = "Your message has been saved";
          if (data.emailSent) {
            successMessage += ` and an email has been sent to ${EMAIL_TO}`;
          } else {
            successMessage += " to the database. Email notification is currently disabled.";
          }
          
          toast({
            title: "Success",
            description: successMessage,
          });
          setIsSubmitSuccess(true);
        } else {
          throw new Error("Function executed but did not return success: " + JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
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

  // Show database setup warning for developers
  if (isDevelopment && tableCheckComplete && !isTableReady) {
    return (
      <div className="space-y-4">
        <div className="p-4 border-2 border-red-300 bg-red-50 rounded-md">
          <h3 className="font-semibold text-red-800">Database Setup Required</h3>
          <p className="text-red-700 mb-2">
            The feedback table could not be created automatically. This might be due to:
          </p>
          <ul className="list-disc pl-5 text-red-700 text-sm">
            <li>Supabase Edge Function is not deployed</li>
            <li>Permission issues with the service role key</li>
            <li>SQL execution errors</li>
          </ul>
          <div className="mt-4">
            <button 
              onClick={() => ensureFeedbackTableExists().then(success => {
                setIsTableReady(success);
                if (success) {
                  toast({
                    title: "Success",
                    description: "Feedback table has been created successfully!",
                  });
                } else {
                  toast({
                    title: "Error",
                    description: "Still unable to create feedback table. Check console for details.",
                    variant: "destructive",
                  });
                }
              })}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Retry Table Creation
            </button>
          </div>
        </div>
        <ConsoleLogViewer consoleOutput={consoleOutput} />
      </div>
    );
  }

  if (isSubmitSuccess) {
    return <SuccessFeedback recipient={EMAIL_TO} onReset={handleReset} />;
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
    <MessageInputForm
      message={message}
      setMessage={setMessage}
      onSubmit={handleSubmit}
      onPreview={handlePreview}
      isLoading={isLoading}
      consoleOutput={consoleOutput}
    />
  );
};

// Internal component for the console log viewer to avoid circular import
const ConsoleLogViewer = ({ consoleOutput }: { consoleOutput: string[] }) => {
  return (
    <div className="mt-4 p-4 bg-black text-white rounded-md font-mono text-sm overflow-x-auto">
      <h4 className="text-white/80 mb-2">Console Output:</h4>
      {consoleOutput.length > 0 ? (
        consoleOutput.map((log, i) => (
          <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
        ))
      ) : (
        <div className="text-gray-400">No console logs yet.</div>
      )}
    </div>
  );
};

export default MessageForm;
