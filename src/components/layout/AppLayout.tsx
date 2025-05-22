import { useState } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppHeader from "@/components/layout/AppHeader";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";
import NavBar from "@/components/layout/NavBar";

const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState<"home" | "tools" | "browse">("home");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const location = useLocation();
  const isSpecialPage = location.pathname === "/profile" || location.pathname === "/admin";

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="app-container">
      <AppHeader 
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
      />
      
      <div className="app-content flex flex-col">
        {!isSpecialPage && (
          <NavBar activeSection={activeSection} setActiveSection={setActiveSection} />
        )}
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            <Outlet context={{ activeSection }} />
          </div>
        </ScrollArea>
      </div>
      
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Ahmed Shawky Youssef</p>
      </footer>
    </div>
  );
};

export default AppLayout;
