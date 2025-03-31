
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAnonKey } from "@/components/share-thoughts/SupabaseConfig";
import DevelopmentModeAlert from "@/components/share-thoughts/DevelopmentModeAlert";
import ConfigErrorAlert from "@/components/share-thoughts/ConfigErrorAlert";
import FeatureDescription from "@/components/share-thoughts/FeatureDescription";
import MessageForm from "@/components/share-thoughts/MessageForm";

const ShareThoughts = () => {
  const [testMode, setTestMode] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Share Your Thoughts</CardTitle>
          <CardDescription>Connect with us and help shape the future of Aito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDevelopment && (
            <DevelopmentModeAlert testMode={testMode} setTestMode={setTestMode} />
          )}

          {(!supabaseAnonKey || isDevelopment) && (
            <ConfigErrorAlert supabaseAnonKey={supabaseAnonKey} />
          )}

          <FeatureDescription />

          <MessageForm testMode={testMode} isDevelopment={isDevelopment} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareThoughts;
