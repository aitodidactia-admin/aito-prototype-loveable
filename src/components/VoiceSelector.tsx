
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Voice {
  id: string;
  name: string;
}

const DEFAULT_VOICES: Voice[] = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

const VoiceSelector = ({ selectedVoice, onVoiceChange }: VoiceSelectorProps) => {
  const handleVoiceChange = useCallback((value: string) => {
    onVoiceChange(value);
  }, [onVoiceChange]);

  return (
    <div className="w-full max-w-xs">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Voice</label>
        <Select value={selectedVoice} onValueChange={handleVoiceChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_VOICES.map((voice) => (
              <SelectItem key={voice.id} value={voice.id}>
                {voice.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default VoiceSelector;
