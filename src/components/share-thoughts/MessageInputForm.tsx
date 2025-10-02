
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface MessageInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const MessageInputForm = ({
  message,
  setMessage,
  onSubmit,
  isLoading,
}: MessageInputFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea 
        className="min-h-[150px]"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
      />
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>Sending & Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Send Feedback
            </>
          )}
        </Button>
      </div>
      
      <p className="text-center text-muted-foreground mt-4">
        Thank you for your interest in Aito, we look forward to hearing from you on how you find the experience.
      </p>
    </form>
  );
};

export default MessageInputForm;
