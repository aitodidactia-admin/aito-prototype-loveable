
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import About from "./pages/About";
import ShareThoughts from "./pages/ShareThoughts";
import NotFound from "./pages/NotFound";

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Ensure the app is fully loaded before rendering content
    setIsLoaded(true);
  }, []);
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navigation />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/share-thoughts" element={<ShareThoughts />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
