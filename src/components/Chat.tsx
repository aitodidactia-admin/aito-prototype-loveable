
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
    <div className="h-screen w-full flex items-center justify-center bg-gradient-radial from-purple-600/80 via-purple-500/70 to-indigo-900/90">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <Button 
            onClick={handleMicrophoneClick} 
            size="icon"
            className={`w-16 h-16 rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white p-0 flex items-center justify-center transition-all duration-300 z-10 relative`}
          >
            {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>
          
          {isListening && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Outer purple circle */}
              <div className="absolute inset-0 -m-10 rounded-full border-2 border-purple-400/80 animate-ping-slow"></div>
              
              {/* Middle white circle */}
              <div className="absolute inset-0 -m-6 rounded-full border-2 border-white/70 animate-ping-medium"></div>
              
              {/* Inner purple circle */}
              <div className="absolute inset-0 -m-3 rounded-full border-2 border-purple-400/90 animate-ping-fast"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
