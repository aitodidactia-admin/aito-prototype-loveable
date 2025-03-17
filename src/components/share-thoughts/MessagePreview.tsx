
import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface MessagePreviewProps {
  emailTo: string;
  message: string;
  onSend: () => void;
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
          <div><strong>From:</strong> sarahdonoghue1@hotmail.com</div>
          <div><strong>Subject:</strong> New Feedback from Aito user</div>
        </div>
        
        <div className="border rounded-md p-4 bg-white">
          <div dangerouslySetInnerHTML={{ __html: formatEmailHtml() }} />
        </div>
        
        <div className="mt-6 flex gap-3">
          <Button onClick={onSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Email Now'}
          </Button>
          <Button variant="outline" onClick={onBack}>
            Edit Message
          </Button>
        </div>
      </Card>
      
      {consoleOutput.length > 0 && (
        <Card className="p-4 border bg-black text-white font-mono text-sm">
          <h4 className="text-lg mb-2 text-white/80">Console Output</h4>
          <div className="overflow-x-auto">
            {consoleOutput.map((log, i) => (
              <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MessagePreview;
