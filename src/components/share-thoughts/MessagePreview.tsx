
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { EMAIL_TO } from "./MessageForm";

interface MessagePreviewProps {
  emailTo: string;
  message: string;
  onSend: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  formatEmailHtml: () => string;
  consoleOutput: string[];
}

const MessagePreview = ({
  emailTo,
  message,
  onSend,
  onBack,
  isLoading,
  formatEmailHtml,
  consoleOutput,
}: MessagePreviewProps) => {
  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
      </Button>
      
      <Card className="p-6 border-2 border-primary/20">
        <h3 className="text-xl font-semibold mb-4">Email Preview</h3>
        
        <div className="space-y-2 text-sm mb-4">
          <div><strong>To:</strong> {emailTo}</div>
          <div><strong>From:</strong> admin@aitodidactia.uk</div>
          <div><strong>Subject:</strong> New Feedback from Aito user</div>
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <div dangerouslySetInnerHTML={{ __html: formatEmailHtml() }} />
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button onClick={(e) => onSend(e)} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Email Now'}
          </Button>
          <Button variant="outline" onClick={onBack}>
            Edit Message
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default MessagePreview;
