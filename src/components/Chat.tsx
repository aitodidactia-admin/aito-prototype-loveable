
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
        <div className="relative">
          <Button 
            onClick={handleMicrophoneClick} 
            size="lg" 
            className={`w-16 h-16 rounded-full transition-all duration-300 ${
              isListening 
                ? "bg-green-500 hover:bg-green-600 shadow-md" 
                : "bg-green-500 hover:bg-green-600 text-white hover:scale-105"
            }`}
          >
            {isListening ? 
              <Mic className="h-6 w-6 animate-pulse" /> : 
              <MicOff className="h-6 w-6" />
            }
          </Button>
          {isListening && (
            <>
              <div className="absolute inset-0 -m-3 rounded-full bg-purple-500/40 animate-ping-slow"></div>
              <div className="absolute inset-0 -m-6 rounded-full bg-white/30 animate-ping-medium"></div>
              <div className="absolute inset-0 -m-9 rounded-full bg-purple-500/20 animate-ping-fast"></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
