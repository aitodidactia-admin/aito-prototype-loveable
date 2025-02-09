
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, Info, Share, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Info, label: "About", path: "/about" },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setIsOpen(false)}>
          <Share className="mr-2 h-4 w-4" />
          Share your thoughts
        </Button>
        <Button onClick={() => setIsOpen(false)}>
          <DollarSign className="mr-2 h-4 w-4" />
          Donate
        </Button>
      </div>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-semibold">
            Warm Voice Pal
          </Link>

          {isMobile ? (
            <>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background border-b p-4 flex flex-col gap-4">
                  <NavContent />
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center gap-8">
              <NavContent />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
