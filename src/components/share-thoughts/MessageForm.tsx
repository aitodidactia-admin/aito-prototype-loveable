
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { supabase, EMAIL_TO } from "./SupabaseConfig";
import SuccessFeedback from "./SuccessFeedback";

interface MessageFormProps {
  testMode: boolean;
  isDevelopment: boolean;
}

const MessageForm = ({ testMode, isDevelopment }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

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
        
        // Artificial delay to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Test Mode: Message Simulated",
          description: `In production, this would send an email to ${EMAIL_TO}. Check console for details.`,
        });
        setIsSubmitSuccess(true);
      } else {
        // Call Supabase Edge Function to send email
        console.log("Attempting to invoke Supabase function");
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to: EMAIL_TO,
            message: message,
            from_website: window.location.origin,
          }
        });
        
        console.log("Supabase function response:", { data, error });
        
        if (error) throw error;
        
        toast({
          title: "Message Sent",
          description: `Your message has been sent to ${EMAIL_TO}. Thank you for reaching out!`,
        });
        setIsSubmitSuccess(true);
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
  };

  if (isSubmitSuccess) {
    return <SuccessFeedback recipient={EMAIL_TO} onReset={handleReset} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea 
        className="min-h-[150px]"
        placeholder="Please share your name and email address to become a Beta Tester or if you're sending feedback please just share your feedback here, however if you want to work with us then please reach out to us and we can share some more information with you"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>Sending Message...</>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" /> Send Message
          </>
        )}
      </Button>
      <p className="text-center text-muted-foreground mt-4">
        Thank you for your interest in Aito, we look forward to hearing from you on how you find the experience.
      </p>
    </form>
  );
};

export default MessageForm;
