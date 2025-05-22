
import { Home, Wrench, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";

interface NavBarProps {
  activeSection: "home" | "tools" | "browse";
  setActiveSection: (section: "home" | "tools" | "browse") => void;
}

const NavBar = ({ activeSection, setActiveSection }: NavBarProps) => {
  const { language } = useSettings();
  
  const isArabic = language === Language.Arabic;

  const navItems = [
    {
      id: "home",
      label: isArabic ? "الرئيسية" : "Home",
      icon: <Home className="h-5 w-5" />
    },
    {
      id: "tools",
      label: isArabic ? "الأدوات" : "Tools",
      icon: <Wrench className="h-5 w-5" />
    },
    {
      id: "browse",
      label: isArabic ? "تصفح" : "Browse",
      icon: <BookOpen className="h-5 w-5" />
    }
  ];

  return (
    <nav className="border-t border-b">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-3 rounded-none gap-1 ${
              activeSection === item.id
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : ""
            }`}
            onClick={() => setActiveSection(item.id as "home" | "tools" | "browse")}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default NavBar;
