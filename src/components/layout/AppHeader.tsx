import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Settings, Bell, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/storage";
import { NotificationStatus } from "@/lib/types";

interface AppHeaderProps {
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const AppHeader = ({ 
  notificationsOpen, 
  setNotificationsOpen, 
  settingsOpen, 
  setSettingsOpen
}: AppHeaderProps) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const notifications = storage.getNotificationsByReceiverId(user.id);
      const unread = notifications.filter(n => n.status === NotificationStatus.Unread).length;
      setUnreadCount(unread);
    }
  }, [user, notificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="mueen logo" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold">mueen</h1>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => {
            setNotificationsOpen(!notificationsOpen);
            if (settingsOpen) setSettingsOpen(false);
          }}
        >
          <Bell className={notificationsOpen ? "text-primary" : ""} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSettingsOpen(!settingsOpen);
            if (notificationsOpen) setNotificationsOpen(false);
          }}
        >
          <Settings className={settingsOpen ? "text-primary" : ""} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={user?.profilePic || "/placeholder.svg"} 
                  alt={user?.username || "User"}
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback>{user?.username?.[0].toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link to="/admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
