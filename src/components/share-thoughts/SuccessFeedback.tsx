
import React from "react";
import { ThumbsUp, Heart, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SuccessFeedbackProps {
  recipient: string;
  onReset: () => void;
}

const SuccessFeedback = ({ recipient, onReset }: SuccessFeedbackProps) => {
  return (
    <Card className="border-2 border-primary/20 bg-primary/5">
      <CardContent className="pt-6 pb-4 px-6 flex flex-col items-center text-center">
        <div className="mb-3 flex justify-center">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">Message Sent Successfully!</h3>
        
        <p className="text-muted-foreground mb-4">
          Thank you for reaching out. Your message has been sent to {recipient}.
          We appreciate your interest in Aito!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" onClick={onReset} className="flex gap-2">
            <Heart className="h-4 w-4" />
            Send Another Message
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessFeedback;
