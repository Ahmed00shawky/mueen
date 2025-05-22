import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSettings } from "@/context/SettingsContext";
import { Language, Theme } from "@/lib/types";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const { language, theme, setLanguage, setTheme } = useSettings();
  
  const toggleLanguage = () => {
    setLanguage(language === Language.English ? Language.Arabic : Language.English);
  };
  
  const isArabic = language === Language.Arabic;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>
            <span>{isArabic ? "الإعدادات" : "Settings"}</span>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          <div className="space-y-6">
            {/* Language Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{isArabic ? "اللغة" : "Language"}</h3>
              <div className="flex items-center justify-between px-2">
                <span>{isArabic ? "تبديل اللغة" : "Toggle Language"}</span>
                <Button 
                  variant="outline" 
                  onClick={toggleLanguage}
                  className="min-w-[100px]"
                >
                  {language === Language.English ? "العربية" : "English"}
                </Button>
              </div>
            </div>
            
            {/* Theme Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-lg">{isArabic ? "المظهر" : "Theme"}</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={theme === Theme.Light ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => setTheme(Theme.Light)}
                >
                  <Sun className="h-6 w-6" />
                  <span>{isArabic ? "فاتح" : "Light"}</span>
                </Button>
                <Button
                  variant={theme === Theme.Dark ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-24 gap-2"
                  onClick={() => setTheme(Theme.Dark)}
                >
                  <Moon className="h-6 w-6" />
                  <span>{isArabic ? "داكن" : "Dark"}</span>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsPanel;
