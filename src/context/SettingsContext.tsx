
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { storage } from "@/lib/storage";
import { Language, Theme, UserSettings } from "@/lib/types";
import { useAuth } from "./AuthContext";

interface SettingsContextType {
  language: Language;
  theme: Theme;
  customColors: Record<string, string>;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setCustomColors: (colors: Record<string, string>) => void;
}

const defaultCustomColors: Record<string, string> = {};

const SettingsContext = createContext<SettingsContextType>({
  language: Language.English,
  theme: Theme.Light,
  customColors: defaultCustomColors,
  setLanguage: () => {},
  setTheme: () => {},
  setCustomColors: () => {},
});

export const useSettings = () => useContext(SettingsContext);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>(Language.English);
  const [theme, setThemeState] = useState<Theme>(Theme.Light);
  const [customColors, setCustomColorsState] = useState<Record<string, string>>(defaultCustomColors);
  
  // Load user settings when user changes
  useEffect(() => {
    if (user) {
      const userSettings = storage.getUserSettings(user.id);
      
      if (userSettings) {
        setLanguageState(userSettings.language);
        setThemeState(userSettings.theme);
        setCustomColorsState(userSettings.customColors || defaultCustomColors);
      } else {
        // Create default settings for user
        const defaultSettings: UserSettings = {
          userId: user.id,
          language: Language.English,
          theme: Theme.Light,
          customColors: defaultCustomColors
        };
        storage.setUserSettings(defaultSettings);
      }
    }
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    if (theme === Theme.Dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply language to document
  useEffect(() => {
    if (language === Language.Arabic) {
      document.documentElement.classList.add('ar');
    } else {
      document.documentElement.classList.remove('ar');
    }
    document.dir = language === Language.Arabic ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (user) {
      const userSettings = storage.getUserSettings(user.id) || {
        userId: user.id,
        theme,
        language: lang,
        customColors
      };
      
      userSettings.language = lang;
      storage.setUserSettings(userSettings);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      const userSettings = storage.getUserSettings(user.id) || {
        userId: user.id,
        theme: newTheme,
        language,
        customColors
      };
      
      userSettings.theme = newTheme;
      storage.setUserSettings(userSettings);
    }
  };

  const setCustomColors = (colors: Record<string, string>) => {
    setCustomColorsState(colors);
    if (user) {
      const userSettings = storage.getUserSettings(user.id) || {
        userId: user.id,
        theme,
        language,
        customColors: colors
      };
      
      userSettings.customColors = colors;
      storage.setUserSettings(userSettings);
    }
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        language, 
        theme, 
        customColors, 
        setLanguage, 
        setTheme, 
        setCustomColors 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
