
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { supabaseUrl } from "./SupabaseConfig";

interface ConfigErrorAlertProps {
  supabaseAnonKey: string;
}

const ConfigErrorAlert = ({ supabaseAnonKey }: ConfigErrorAlertProps) => {
  if (supabaseAnonKey) return null;
  
  return (
    <Alert variant="destructive">
      <Info className="h-4 w-4" />
      <AlertTitle>Configuration Missing</AlertTitle>
      <AlertDescription>
        <p>Supabase anon key is missing. Please set VITE_SUPABASE_ANON_KEY in your .env file or environment variables.</p>
        <p className="mt-2">Supabase URL is set to: {supabaseUrl}</p>
      </AlertDescription>
    </Alert>
  );
};

export default ConfigErrorAlert;
