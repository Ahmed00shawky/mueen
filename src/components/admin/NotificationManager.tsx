import { useState, useEffect } from "react";
import { User, Notification, NotificationType, NotificationStatus } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const NotificationManager = () => {
  const { user } = useAuth();
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [users, setUsers] = useState<User[]>(storage.getUsers());
  const [sentNotifications, setSentNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: NotificationType.Popup,
    link: "",
    selectedUsers: [] as string[],
    selectAll: false,
  });
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    type: NotificationType.Popup,
    link: "",
  });
  
  useEffect(() => {
    if (user) {
      const notifications = storage.getNotificationsBySenderId(user.id);
      setSentNotifications(notifications);
    }
  }, [user]);
  
  const handleSelectAllChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectAll: checked,
      selectedUsers: checked ? users.map((user) => user.id) : [],
    }));
  };
  
  const handleUserSelection = (userId: string, checked: boolean) => {
    setFormData((prev) => {
      const newSelectedUsers = checked
        ? [...prev.selectedUsers, userId]
        : prev.selectedUsers.filter((id) => id !== userId);
      
      return {
        ...prev,
        selectedUsers: newSelectedUsers,
        selectAll: newSelectedUsers.length === users.length,
      };
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleNotificationTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      type: value as NotificationType,
    }));
  };
  
  const handleDeleteNotification = (notificationId: string) => {
    storage.deleteNotification(notificationId);
    setSentNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast({
      title: isArabic ? "تم الحذف" : "Deleted",
      description: isArabic ? "تم حذف الإشعار بنجاح" : "Notification deleted successfully",
    });
  };
  
  const handleDeleteAllNotifications = () => {
    if (sentNotifications.length === 0) {
      toast({
        title: isArabic ? "تنبيه" : "Warning",
        description: isArabic ? "لا توجد إشعارات للحذف" : "No notifications to delete",
        variant: "destructive",
      });
      return;
    }

    sentNotifications.forEach((notification) => {
      storage.deleteNotification(notification.id);
    });
    setSentNotifications([]);
    toast({
      title: isArabic ? "تم الحذف" : "Deleted",
      description: isArabic ? "تم حذف جميع الإشعارات بنجاح" : "All notifications deleted successfully",
    });
  };
  
  const handleSendNotification = () => {
    if (!user) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى ملء العنوان والمحتوى"
          : "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.selectedUsers.length === 0) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى تحديد مستخدم واحد على الأقل"
          : "Please select at least one user",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.type === NotificationType.Redirect && !formData.link) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى إدخال رابط للتوجيه"
          : "Please enter a link for redirection",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    
    formData.selectedUsers.forEach((receiverId) => {
      const notification: Notification = {
        id: uuidv4(),
        senderId: user.id,
        receiverId,
        title: formData.title,
        content: formData.content,
        type: formData.type,
        link: formData.type === NotificationType.Redirect ? formData.link : undefined,
        status: NotificationStatus.Unread,
        sentAt: now,
      };
      
      storage.addNotification(notification);
    });
    
    // Update sent notifications list
    const newNotifications = formData.selectedUsers.map((receiverId) => ({
      id: uuidv4(),
      senderId: user.id,
      receiverId,
      title: formData.title,
      content: formData.content,
      type: formData.type,
      link: formData.type === NotificationType.Redirect ? formData.link : undefined,
      status: NotificationStatus.Unread,
      sentAt: now,
    }));
    
    setSentNotifications((prev) => [...newNotifications, ...prev]);
    
    toast({
      title: isArabic ? "تم الإرسال" : "Sent Successfully",
      description: isArabic 
        ? `تم إرسال الإشعار إلى ${formData.selectedUsers.length} مستخدم`
        : `Notification sent to ${formData.selectedUsers.length} user(s)`,
    });
    
    // Reset form
    setFormData({
      title: "",
      content: "",
      type: NotificationType.Popup,
      link: "",
      selectedUsers: [],
      selectAll: false,
    });
  };

  const handleEditNotification = (notification: Notification) => {
    setEditingNotification(notification);
    setEditFormData({
      title: notification.title,
      content: notification.content,
      type: notification.type,
      link: notification.link || "",
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditNotificationTypeChange = (value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      type: value as NotificationType,
    }));
  };

  const handleSaveEdit = () => {
    if (!editingNotification) return;
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى ملء العنوان والمحتوى"
          : "Please fill in title and content",
        variant: "destructive",
      });
      return;
    }

    if (editFormData.type === NotificationType.Redirect && !editFormData.link) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى إدخال رابط للتوجيه"
          : "Please enter a link for redirection",
        variant: "destructive",
      });
      return;
    }

    const updatedNotification: Notification = {
      ...editingNotification,
      title: editFormData.title,
      content: editFormData.content,
      type: editFormData.type,
      link: editFormData.type === NotificationType.Redirect ? editFormData.link : undefined,
    };

    storage.updateNotification(updatedNotification);
    setSentNotifications((prev) =>
      prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
    );

    toast({
      title: isArabic ? "تم التحديث" : "Updated",
      description: isArabic ? "تم تحديث الإشعار بنجاح" : "Notification updated successfully",
    });

    setEditingNotification(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-4">
          {isArabic ? "إنشاء إشعار جديد" : "Create New Notification"}
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{isArabic ? "العنوان" : "Title"}</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={isArabic ? "عنوان الإشعار" : "Notification title"}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">{isArabic ? "المحتوى" : "Content"}</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder={isArabic ? "محتوى الإشعار" : "Notification content"}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{isArabic ? "نوع الإشعار" : "Notification Type"}</Label>
            <RadioGroup value={formData.type} onValueChange={handleNotificationTypeChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={NotificationType.Popup} id="popup" />
                <Label htmlFor="popup">{isArabic ? "منبثق" : "Popup"}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={NotificationType.Redirect} id="redirect" />
                <Label htmlFor="redirect">{isArabic ? "توجيه" : "Redirect"}</Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.type === NotificationType.Redirect && (
            <div className="space-y-2">
              <Label htmlFor="link">{isArabic ? "الرابط" : "Link"}</Label>
              <Input
                id="link"
                name="link"
                value={formData.link}
                onChange={handleInputChange}
                placeholder={isArabic ? "مثال: /dashboard" : "e.g., /dashboard"}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>{isArabic ? "المستلمون" : "Recipients"}</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={formData.selectAll}
                  onCheckedChange={handleSelectAllChange}
                />
                <Label htmlFor="selectAll">{isArabic ? "تحديد الكل" : "Select All"}</Label>
              </div>
            </div>
            
            <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={formData.selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                  />
                  <Label htmlFor={`user-${user.id}`}>{user.username}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <Button onClick={handleSendNotification} className="w-full">
            {isArabic ? "إرسال الإشعار" : "Send Notification"}
          </Button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">
            {isArabic ? "الإشعارات المرسلة" : "Sent Notifications"}
          </h2>
          {sentNotifications.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllNotifications}
            >
              {isArabic ? "حذف الكل" : "Delete All"}
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {sentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground">{notification.content}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span>
                      {isArabic ? "إلى: " : "To: "}
                      {users.find(u => u.id === notification.receiverId)?.username}
                    </span>
                    <span>•</span>
                    <span>{format(new Date(notification.sentAt), "PPP")}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditNotification(notification)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-destructive hover:text-destructive/90"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={!!editingNotification} onOpenChange={() => setEditingNotification(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "تعديل الإشعار" : "Edit Notification"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">{isArabic ? "العنوان" : "Title"}</Label>
              <Input
                id="edit-title"
                name="title"
                value={editFormData.title}
                onChange={handleEditInputChange}
                placeholder={isArabic ? "عنوان الإشعار" : "Notification title"}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content">{isArabic ? "المحتوى" : "Content"}</Label>
              <Textarea
                id="edit-content"
                name="content"
                value={editFormData.content}
                onChange={handleEditInputChange}
                placeholder={isArabic ? "محتوى الإشعار" : "Notification content"}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{isArabic ? "نوع الإشعار" : "Notification Type"}</Label>
              <RadioGroup value={editFormData.type} onValueChange={handleEditNotificationTypeChange} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={NotificationType.Popup} id="edit-popup" />
                  <Label htmlFor="edit-popup">{isArabic ? "منبثق" : "Popup"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={NotificationType.Redirect} id="edit-redirect" />
                  <Label htmlFor="edit-redirect">{isArabic ? "توجيه" : "Redirect"}</Label>
                </div>
              </RadioGroup>
            </div>
            
            {editFormData.type === NotificationType.Redirect && (
              <div className="space-y-2">
                <Label htmlFor="edit-link">{isArabic ? "الرابط" : "Link"}</Label>
                <Input
                  id="edit-link"
                  name="link"
                  value={editFormData.link}
                  onChange={handleEditInputChange}
                  placeholder={isArabic ? "مثال: /dashboard" : "e.g., /dashboard"}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNotification(null)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveEdit}>
              {isArabic ? "حفظ التغييرات" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationManager;
