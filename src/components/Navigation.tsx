
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Share your thoughts", path: "/share-thoughts" },
  ];

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2">
        {menuItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`text-white hover:bg-white/10 hover:text-white ${
              location.pathname === item.path ? "bg-white/10" : ""
            }`}
            asChild
            onClick={() => setIsOpen(false)}
          >
            <Link to={item.path}>
              {item.label}
            </Link>
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button 
          className="bg-white/90 text-black hover:bg-white"
          asChild
        >
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-semibold text-white">
            Aito
          </Link>

          {isMobile ? (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/10"
                onClick={toggleMenu}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              {isOpen && (
                <div className="absolute top-16 left-0 right-0 bg-black border-b border-white/10 p-4 flex flex-col gap-4">
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
