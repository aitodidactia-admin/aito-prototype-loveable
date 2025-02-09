
import { Slider } from "@/components/ui/slider";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

const VolumeControl = ({
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
}: VolumeControlProps) => {
  return (
    <div className="flex items-center space-x-4 w-full max-w-xs">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMuteToggle}
        className="hover:bg-secondary"
      >
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      <Slider
        value={[isMuted ? 0 : volume * 100]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0] / 100)}
        className="flex-1"
      />
    </div>
  );
};

export default VolumeControl;
