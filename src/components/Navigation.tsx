
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild onClick={() => setIsOpen(false)}>
          <Link to="/share-thoughts">
            Share your thoughts
          </Link>
        </Button>
        <Button asChild>
          <a 
            href="https://www.gofundme.com/f/help-launch-aito?attribution_id=sl:65796281-dd63-478d-82fd-2bd44bf3dae8&utm_campaign=man_ss_icons&utm_medium=customer&utm_source=copy_link" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Donate
          </a>
        </Button>
      </div>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-semibold">
            Aito
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
            <div className="flex items-center gap-2">
              <NavContent />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
