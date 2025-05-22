
import { useState } from "react";
import { format } from "date-fns";
import { Check, Link as LinkIcon, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Notification, NotificationStatus, NotificationType } from "@/lib/types";

interface NotificationItemProps {
  notification: Notification;
  onUpdate: (notification: Notification) => void;
  onClose: () => void;
}

const NotificationItem = ({ notification, onUpdate, onClose }: NotificationItemProps) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isUnread = notification.status === NotificationStatus.Unread;

  const handleClick = () => {
    if (notification.type === NotificationType.Popup) {
      setIsDialogOpen(true);
    } else if (notification.type === NotificationType.Redirect && notification.link) {
      onClose();
      navigate(notification.link);
    }

    if (isUnread) {
      onUpdate({
        ...notification,
        status: NotificationStatus.Read
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <div 
        className={`p-3 rounded-lg cursor-pointer ${
          isUnread ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary"
        }`}
        onClick={handleClick}
      >
        <div className="flex justify-between items-start mb-1">
          <h4 className={`font-medium ${isUnread ? "text-primary" : ""}`}>
            {notification.title}
          </h4>
          <span className="text-xs text-muted-foreground">
            {format(new Date(notification.sentAt), "MMM d, HH:mm")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {notification.content}
        </p>
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            {notification.type === NotificationType.Popup ? (
              <AlertCircle className="h-3 w-3" />
            ) : (
              <LinkIcon className="h-3 w-3" />
            )}
            <span>
              {notification.type === NotificationType.Popup ? "Shows dialog" : "Opens page"}
            </span>
          </div>
          {isUnread && (
            <div className="flex items-center gap-1 text-primary">
              <span>Unread</span>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={closeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{notification.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {notification.content}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={closeDialog}>
              <Check className="mr-2 h-4 w-4" />
              Ok
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default NotificationItem;
