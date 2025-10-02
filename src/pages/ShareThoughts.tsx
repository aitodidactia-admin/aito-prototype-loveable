
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import FeatureDescription from "@/components/share-thoughts/FeatureDescription";
import MessageForm from "@/components/share-thoughts/MessageForm";

const ShareThoughts = () => {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "#9966cc" }}>
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FeatureDescription />
            <MessageForm testMode={false} isDevelopment={isDevelopment} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShareThoughts;
