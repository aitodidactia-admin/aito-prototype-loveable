
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, EMAIL_TO } from "./SupabaseConfig";
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
  const consoleOutput = useConsoleLogger();

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

export default MessageForm;
