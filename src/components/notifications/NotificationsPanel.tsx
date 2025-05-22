import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Notification, NotificationStatus } from "@/lib/types";
import { storage } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import NotificationItem from "./NotificationItem";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const NotificationsPanel = ({ open, onClose }: NotificationsPanelProps) => {
  const { user } = useAuth();
  const { language } = useSettings();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const isArabic = language === Language.Arabic;

  useEffect(() => {
    if (user && open) {
      loadNotifications();
    }
  }, [user, open]);

  const loadNotifications = () => {
    if (!user) return;
    
    const userNotifications = storage.getNotificationsByReceiverId(user.id);
    setNotifications(userNotifications);
  };

  const handleMarkAllAsRead = () => {
    if (!user) return;
    
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      status: NotificationStatus.Read
    }));
    
    updatedNotifications.forEach(notification => {
      storage.updateNotification(notification);
    });
    
    setNotifications(updatedNotifications);
  };

  const handleNotificationUpdate = (updatedNotification: Notification) => {
    storage.updateNotification(updatedNotification);
    
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === updatedNotification.id ? updatedNotification : notification
      )
    );
  };

  const filteredNotifications = activeTab === "all" 
    ? notifications 
    : notifications.filter(notification => notification.status === NotificationStatus.Unread);

  const unreadCount = notifications.filter(
    notification => notification.status === NotificationStatus.Unread
  ).length;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <span>{isArabic ? "الإشعارات" : "Notifications"}</span>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center h-5 w-5 text-xs font-semibold text-white bg-destructive rounded-full ml-1">
                  {unreadCount}
                </span>
              )}
            </div>
          </SheetTitle>
          
          <div className="flex space-x-1 rounded-lg bg-muted p-1">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${activeTab === "all" ? "bg-background shadow-sm" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {isArabic ? "الكل" : "All"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 ${activeTab === "unread" ? "bg-background shadow-sm" : ""}`}
              onClick={() => setActiveTab("unread")}
            >
              {isArabic ? "غير مقروءة" : "Unread"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              {isArabic ? "اقرأ الكل" : "Mark all read"}
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-8rem)] pb-4 mt-4">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onUpdate={handleNotificationUpdate}
                  onClose={onClose}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p>
                {activeTab === "all" 
                  ? isArabic ? "لا توجد إشعارات" : "No notifications"
                  : isArabic ? "لا توجد إشعارات غير مقروءة" : "No unread notifications"}
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
