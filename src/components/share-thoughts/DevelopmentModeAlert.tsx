
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface DevelopmentModeAlertProps {
  testMode: boolean;
  setTestMode: (mode: boolean) => void;
}

// This component has been disabled to remove development mode alerts from the UI
const DevelopmentModeAlert = ({ testMode, setTestMode }: DevelopmentModeAlertProps) => {
  return null;
};

export default DevelopmentModeAlert;
