
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Send, Eye, ArrowLeft } from "lucide-react";
import { supabase, EMAIL_TO } from "./SupabaseConfig";
import SuccessFeedback from "./SuccessFeedback";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface MessageFormProps {
  testMode: boolean;
  isDevelopment: boolean;
}

const MessageForm = ({ testMode, isDevelopment }: MessageFormProps) => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);

  // Override console.log to capture output
  React.useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      originalConsoleLog(...args);
      setConsoleOutput(prev => [...prev, args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')]);
    };
    
    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const formatEmailHtml = () => {
    return `
      <h2>New message from your website</h2>
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
    console.log(`From: ${fromEmail || 'Default email'}`);
    console.log(`Subject: New message from ${window.location.origin}`);
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
          from_email: fromEmail,
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
            from_email: fromEmail,
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
    setFromEmail("");
    setIsSubmitSuccess(false);
    setIsPreviewMode(false);
    setConsoleOutput([]);
  };

  if (isSubmitSuccess) {
    return <SuccessFeedback recipient={EMAIL_TO} onReset={handleReset} />;
  }

  if (isPreviewMode) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setIsPreviewMode(false)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Editor
        </Button>
        
        <Card className="p-6 border-2 border-primary/20">
          <h3 className="text-xl font-semibold mb-4">Email Preview</h3>
          
          <div className="space-y-2 text-sm mb-4">
            <div><strong>To:</strong> {EMAIL_TO}</div>
            <div><strong>From:</strong> {fromEmail || 'Default email (configured in server)'}</div>
            <div><strong>Subject:</strong> New message from {window.location.origin}</div>
          </div>
          
          <div className="border rounded-md p-4 bg-white">
            <div dangerouslySetInnerHTML={{ __html: formatEmailHtml() }} />
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Email Now'}
            </Button>
            <Button variant="outline" onClick={() => setIsPreviewMode(false)}>
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
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="fromEmail" className="text-sm font-medium">
          Your Email (optional)
        </label>
        <Input
          id="fromEmail"
          type="email"
          placeholder="your@email.com"
          value={fromEmail}
          onChange={(e) => setFromEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
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
            <>Sending Message...</>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Message
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handlePreview}
          disabled={!message.trim() || isLoading}
          className="flex-1 sm:flex-initial"
        >
          <Eye className="mr-2 h-4 w-4" /> Preview Email
        </Button>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="link" type="button" className="w-full">
            View Console Logs
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Console Logs</DialogTitle>
          </DialogHeader>
          <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
            {consoleOutput.length > 0 ? (
              consoleOutput.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
              ))
            ) : (
              <div className="text-gray-400">No console logs yet. Try previewing or sending a message.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <p className="text-center text-muted-foreground mt-4">
        Thank you for your interest in Aito, we look forward to hearing from you on how you find the experience.
      </p>
    </form>
  );
};

export default MessageForm;
