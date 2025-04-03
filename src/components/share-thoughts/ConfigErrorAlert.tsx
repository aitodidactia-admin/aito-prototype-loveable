
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const ConfigErrorAlert = () => {
  // Since we're not using Supabase anymore, we'll adapt this component
  // to provide information about the Netlify functions setup
  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        <p>This app uses Netlify Functions for processing feedback submissions.</p>
        <p className="mt-2">In development mode, feedback is stored in localStorage.</p>
      </AlertDescription>
    </Alert>
  );
};

export default ConfigErrorAlert;
