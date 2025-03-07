
import { useState, useCallback } from "react";
import { useConversation } from "@11labs/react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

const Chat = () => {
  const [isListening, setIsListening] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      toast.success("Connected to voice service");
    },
    onDisconnect: () => {
      setIsListening(false);
      toast.info("Disconnected from voice service");
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
      setIsListening(false);
    },
  });

  const handleMicrophoneClick = useCallback(async () => {
    try {
      if (!isListening) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: "uREm6tctQtdBnhYSh29B",
        });
        setIsListening(true);
      } else {
        await conversation.endSession();
        setIsListening(false);
      }
    } catch (error) {
      toast.error("Error accessing microphone");
      console.error(error);
    }
  }, [isListening, conversation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-radial from-[#7a6fbf] via-[#655ca0] to-[#4b4678]">
      <Card className="glass p-8 max-w-md w-full space-y-8 animate-fade-up">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-6">
            <Button
              onClick={handleMicrophoneClick}
              size="lg"
              className={`w-16 h-16 rounded-full ${
                isListening 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-transparent hover:bg-white/10 text-white border border-white/20"
              }`}
            >
              {isListening ? (
                <div className="mic-pulse">
                  <Mic className="h-6 w-6" />
                </div>
              ) : (
                <MicOff className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Chat;
