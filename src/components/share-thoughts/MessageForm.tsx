import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import SuccessFeedback from "./SuccessFeedback";
import MessageInputForm from "./MessageInputForm";
import { useConsoleLogger } from "./useConsoleLogger";
import { handleFeedbackSubmission } from "./services/feedbackService";

// Email configuration - updated recipient
export const EMAIL_TO = "admin@aitodidactia.uk";

interface MessageFormProps {
  testMode: boolean;
  isDevelopment: boolean;
}

const MessageForm = ({ testMode, isDevelopment }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const consoleOutput = useConsoleLogger();

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
      const result = await handleFeedbackSubmission(
        message,
        window.location.origin,
        isDevelopment,
        testMode
      );
      
      if (result.success) {
        let successMessage = "Your feedback has been saved";
        
        if (isDevelopment && testMode) {
          successMessage += " to local storage. Check browser dev tools for details.";
        } else if (result.emailSent) {
          successMessage += ` and an email has been sent to ${EMAIL_TO}`;
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
