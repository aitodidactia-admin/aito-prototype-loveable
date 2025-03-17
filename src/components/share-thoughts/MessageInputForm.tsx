
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Eye } from "lucide-react";
import ConsoleLogViewer from "./ConsoleLogViewer";

interface MessageInputFormProps {
  message: string;
  setMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onPreview: () => void;
  isLoading: boolean;
  consoleOutput: string[];
}

const MessageInputForm = ({
  message,
  setMessage,
  onSubmit,
  onPreview,
  isLoading,
  consoleOutput,
}: MessageInputFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Textarea 
        className="min-h-[150px]"
        placeholder="Please share your name and email address to become a Beta Tester or if you're sending feedback please just share your feedback here, however if you want to work with us then please reach out to us and we can share some more information with you"
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
              <Save className="mr-2 h-4 w-4" /> Send & Save Feedback
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={onPreview}
          disabled={!message.trim() || isLoading}
          className="flex-1 sm:flex-initial"
        >
          <Eye className="mr-2 h-4 w-4" /> Preview Email
        </Button>
      </div>
      
      <ConsoleLogViewer consoleOutput={consoleOutput} />
      
      <p className="text-center text-muted-foreground mt-4">
        Thank you for your interest in Aito, we look forward to hearing from you on how you find the experience.
      </p>
    </form>
  );
};

export default MessageInputForm;
