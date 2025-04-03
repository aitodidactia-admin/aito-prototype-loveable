
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabaseAnonKey } from "@/components/share-thoughts/SupabaseConfig";
import ConfigErrorAlert from "@/components/share-thoughts/ConfigErrorAlert";
import FeatureDescription from "@/components/share-thoughts/FeatureDescription";
import MessageForm from "@/components/share-thoughts/MessageForm";

const ShareThoughts = () => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="container mx-auto px-4 pt-24 pb-12 min-h-screen bg-primary/10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Share Your Thoughts</CardTitle>
          <CardDescription>Connect with us and help shape the future of Aito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(!supabaseAnonKey || isDevelopment) && (
            <ConfigErrorAlert supabaseAnonKey={supabaseAnonKey} />
          )}

          <FeatureDescription />

          <MessageForm testMode={false} isDevelopment={isDevelopment} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareThoughts;
