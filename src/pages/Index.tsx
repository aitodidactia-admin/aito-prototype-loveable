
import { Button } from "@/components/ui/button";
import Chat from "@/components/Chat";
import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <div className="container mx-auto px-4 pt-24 pb-12">
      <div className="max-w-3xl mx-auto mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Aito</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your AI-powered coaching and training platform for soft skills development
        </p>
        
        <div className="flex justify-center gap-4 mb-12">
          <Button asChild size="lg">
            <Link to="/share-thoughts">
              <MessageSquare className="mr-2 h-5 w-5" /> Share Your Thoughts
            </Link>
          </Button>
        </div>
      </div>
      
      <Chat />
    </div>
  );
};

export default Index;
