
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Chat from "@/components/Chat";
import { Link } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 

const Index = () => {
  const [hasError, setHasError] = useState(false);

  // Add error handling around the Chat component
  const handleError = (error: Error) => {
    console.error("Error in Chat component:", error);
    setHasError(true);
  };
  
  return (
    <div className="w-full h-full">
      {hasError ? (
        <div className="container mx-auto p-8 max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              We're sorry, but the chat feature couldn't be loaded.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Link to="/share-thoughts">
              <Button variant="default">Contact Instead</Button>
            </Link>
          </div>
        </div>
      ) : (
        <ErrorBoundary onError={handleError}>
          <Chat />
        </ErrorBoundary>
      )}
    </div>
  );
};

// Simple error boundary component
function ErrorBoundary({ children, onError }: { children: React.ReactNode, onError: (error: Error) => void }) {
  try {
    return <>{children}</>;
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('Unknown error'));
    }
    return null;
  }
}

export default Index;
