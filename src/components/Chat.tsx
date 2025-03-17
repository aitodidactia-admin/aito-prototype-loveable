
import { useState, useCallback } from "react";
import { useConversation } from "@11labs/react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    onError: error => {
      toast.error("Error: " + error.message);
      setIsListening(false);
    }
  });

  const handleMicrophoneClick = useCallback(async () => {
    try {
      if (!isListening) {
        await navigator.mediaDevices.getUserMedia({
          audio: true
        });
        await conversation.startSession({
          agentId: "uREm6tctQtdBnhYSh29B"
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
    <div className="h-screen w-full flex items-center justify-center bg-gradient-radial from-[#7a6fbf] via-[#655ca0] to-[#4b4678]">
      <div className="flex flex-col items-center space-y-6">
        <div className={`relative ${isListening ? 
          "before:absolute before:inset-0 before:-m-8 before:rounded-full before:bg-green-500/30 before:animate-pulse after:absolute after:inset-0 after:-m-16 after:rounded-full after:bg-green-500/20 after:animate-ping" 
          : ""}`}>
          <Button 
            onClick={handleMicrophoneClick} 
            size="lg" 
            className={`w-24 h-24 rounded-full transition-all duration-300 ${
              isListening 
                ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50" 
                : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
            }`}
          >
            {isListening ? 
              <div className="relative">
                <Mic className="h-10 w-10 animate-pulse" />
                <div className="absolute inset-0 rounded-full bg-white/30 animate-ping"></div>
              </div> : 
              <MicOff className="h-10 w-10" />
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
