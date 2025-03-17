import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ShareThoughts = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const EMAIL_TO = "sarahdonoghue1@hotmail.com"; // Email address updated

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
      // Call Supabase Edge Function to send email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: EMAIL_TO,
          message: message,
          from_website: window.location.origin,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${EMAIL_TO}. Thank you for reaching out!`,
      });
      
      // Clear the form
      setMessage("");
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

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Share Your Thoughts</CardTitle>
          <CardDescription>Connect with us and help shape the future of Aito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">What Can You Do Here?</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Join the Beta Test</h3>
                <p className="text-muted-foreground">
                  Just send us your first name and email address, and one of the team will be in touch. 
                  It's free to join and use the Aito Beta Test, but contributions are extremely important 
                  in supporting our development and running costs. If you feel you'd like to help, please 
                  use the 'Donate' Button above…
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Send us Feedback</h3>
                <p className="text-muted-foreground">
                  We're continually evolving Aito based on your comments. We love to hear good things, 
                  but we can only make Aito work better for you by hearing the things we need to work on...
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Want to Work with Us</h3>
                <p className="text-muted-foreground">
                  Aito can be configured with ANY content, and is an excellent coaching and training 
                  platform for soft skills in particular. Reach out if you'd like to know more..
                </p>
              </div>

              <div className="mt-6">
                <p className="text-muted-foreground italic">
                  You can also reach us through Aito – he'll pass on your message to the team.
                </p>
              </div>
            </div>
          </section>

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
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareThoughts;
