
import { Button } from "@/components/ui/button";
import Chat from "@/components/Chat";
import { Link } from "react-router-dom";

const Index = () => {
  // Add debug logging to see if component mounts
  console.log("Index component rendering");
  
  return (
    <div className="container mx-auto px-4 py-24">
      <Chat />
    </div>
  );
};

export default Index;
