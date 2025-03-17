
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface DevelopmentModeAlertProps {
  testMode: boolean;
  setTestMode: (mode: boolean) => void;
}

const DevelopmentModeAlert = ({ testMode, setTestMode }: DevelopmentModeAlertProps) => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertTitle>Development Mode</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>You're in development mode. Toggle test mode to simulate email sending without actually sending emails.</p>
        <div className="flex items-center gap-2">
          <Button 
            variant={testMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTestMode(true)}
          >
            Test Mode
          </Button>
          <Button 
            variant={!testMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => setTestMode(false)}
          >
            Live Mode
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default DevelopmentModeAlert;
