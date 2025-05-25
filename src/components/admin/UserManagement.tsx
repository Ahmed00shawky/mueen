import { useState, useEffect } from "react";
import { User, UserRole, UserStatus, Permission } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from "@/context/WebSocketContext";
import { RefreshCw } from "lucide-react";

const UserManagement = () => {
  const { language } = useSettings();
  const { isConnected, lastMessage, reconnect } = useWebSocket();
  const isArabic = language === Language.Arabic;
  const [users, setUsers] = useState<User[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: UserRole.User,
    permissions: [] as Permission[],
  });
  
  useEffect(() => {
    loadUsers();
    
    // Subscribe to storage updates
    const handleStorageUpdate = (data: any) => {
      loadUsers();
    };
    
    storage.onUserUpdate(handleStorageUpdate);
    
    return () => {
      storage.offUserUpdate(handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'user_update':
        case 'user_added':
        case 'user_deleted':
        case 'status_changed':
          loadUsers();
          break;
      }
    }
  }, [lastMessage]);
  
  const loadUsers = () => {
    const allUsers = storage.getUsers();
    setUsers(allUsers);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role,
      permissions: [...user.permissions],
    });
    setIsEditDialogOpen(true);
  };

  const handleCreateUser = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: UserRole.User,
      permissions: [Permission.ViewTools, Permission.ViewBrowse],
    });
    setIsCreateDialogOpen(true);
  };
  
  const handleDeleteUser = (userId: string) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد من رغبتك في حذف هذا المستخدم؟' : 'Are you sure you want to delete this user?')) {
      storage.deleteUser(userId);
      loadUsers();
      toast({
        title: isArabic ? "تم الحذف" : "User Deleted",
        description: isArabic 
          ? "تم حذف المستخدم بنجاح"
          : "The user has been deleted successfully",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleRoleChange = (role: UserRole) => {
    setFormData((prev) => ({
      ...prev,
      role,
      // If admin, grant all permissions
      permissions: role === UserRole.Admin ? Object.values(Permission) as Permission[] : prev.permissions,
    }));
  };
  
  const handlePermissionToggle = (permission: Permission, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter((p) => p !== permission),
    }));
  };
  
  const handleSaveUser = () => {
    if (!editingUser) return;
    
    const updatedUser: User = {
      ...editingUser,
      username: formData.username,
      email: formData.email || undefined,
      role: formData.role,
      permissions: formData.permissions,
    };
    
    storage.updateUser(updatedUser);
    loadUsers();
    setIsEditDialogOpen(false);
    
    toast({
      title: isArabic ? "تم التحديث" : "User Updated",
      description: isArabic 
        ? "تم تحديث معلومات المستخدم بنجاح"
        : "User information has been updated successfully",
    });
  };

  const handleCreateNewUser = () => {
    if (!formData.username || !formData.password) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newUser: User = {
      id: uuidv4(),
      username: formData.username,
      password: formData.password,
      email: formData.email || undefined,
      role: formData.role,
      status: UserStatus.Offline,
      permissions: formData.permissions,
      lastLogin: new Date().toISOString()
    };

    storage.addUser(newUser);
    loadUsers();
    setIsCreateDialogOpen(false);
    
    toast({
      title: isArabic ? "تم الإنشاء" : "User Created",
      description: isArabic 
        ? "تم إنشاء المستخدم بنجاح"
        : "User has been created successfully",
    });
  };

  const permissionLabels = {
    // General permissions
    [Permission.ViewTools]: isArabic ? "عرض الأدوات" : "View Tools",
    [Permission.EditTools]: isArabic ? "تعديل الأدوات" : "Edit Tools",
    [Permission.ViewBrowse]: isArabic ? "عرض التصفح" : "View Browse",
    [Permission.EditBrowse]: isArabic ? "تعديل التصفح" : "Edit Browse",
    [Permission.ViewAdmin]: isArabic ? "عرض لوحة التحكم" : "View Admin",
    [Permission.SendNotifications]: isArabic ? "إرسال الإشعارات" : "Send Notifications",
    [Permission.ManageUsers]: isArabic ? "إدارة المستخدمين" : "Manage Users",
    
    // Todo Tool permissions
    [Permission.ViewTodo]: isArabic ? "عرض قائمة المهام" : "View Todo List",
    [Permission.EditTodo]: isArabic ? "تعديل قائمة المهام" : "Edit Todo List",
    
    // Date Converter Tool permissions
    [Permission.ViewDateConverter]: isArabic ? "عرض محول التاريخ" : "View Date Converter",
    [Permission.EditDateConverter]: isArabic ? "تعديل محول التاريخ" : "Edit Date Converter",
    
    // Time Calculator Tool permissions
    [Permission.ViewTimeCalculator]: isArabic ? "عرض حاسبة الوقت" : "View Time Calculator",
    [Permission.EditTimeCalculator]: isArabic ? "تعديل حاسبة الوقت" : "Edit Time Calculator",
    
    // Notepad Tool permissions
    [Permission.ViewNotepad]: isArabic ? "عرض المفكرة" : "View Notepad",
    [Permission.EditNotepad]: isArabic ? "تعديل المفكرة" : "Edit Notepad",
    
    // Monthly Vacations Tool permissions
    [Permission.ViewMonthlyVacations]: isArabic ? "عرض الإجازات الشهرية" : "View Monthly Vacations",
    [Permission.EditMonthlyVacations]: isArabic ? "تعديل الإجازات الشهرية" : "Edit Monthly Vacations",

    // Monthly Leave Tool permissions
    [Permission.ViewMonthlyLeave]: isArabic ? "عرض الإجازات الشهرية للموظفين" : "View Monthly Leave",
    [Permission.EditMonthlyLeave]: isArabic ? "تعديل الإجازات الشهرية للموظفين" : "Edit Monthly Leave"
  };

  // Group permissions by category
  const permissionGroups = {
    general: [
      Permission.ViewTools,
      Permission.EditTools,
      Permission.ViewBrowse,
      Permission.EditBrowse,
      Permission.ViewAdmin,
      Permission.SendNotifications,
      Permission.ManageUsers
    ],
    todo: [
      Permission.ViewTodo,
      Permission.EditTodo
    ],
    dateConverter: [
      Permission.ViewDateConverter,
      Permission.EditDateConverter
    ],
    timeCalculator: [
      Permission.ViewTimeCalculator,
      Permission.EditTimeCalculator
    ],
    notepad: [
      Permission.ViewNotepad,
      Permission.EditNotepad
    ],
    monthlyVacations: [
      Permission.ViewMonthlyVacations,
      Permission.EditMonthlyVacations
    ],
    monthlyLeave: [
      Permission.ViewMonthlyLeave,
      Permission.EditMonthlyLeave
    ]
  };

  const groupLabels = {
    general: isArabic ? "الصلاحيات العامة" : "General Permissions",
    todo: isArabic ? "قائمة المهام" : "Todo List",
    dateConverter: isArabic ? "محول التاريخ" : "Date Converter",
    timeCalculator: isArabic ? "حاسبة الوقت" : "Time Calculator",
    notepad: isArabic ? "المفكرة" : "Notepad",
    monthlyVacations: isArabic ? "الإجازات الشهرية" : "Monthly Vacations",
    monthlyLeave: isArabic ? "إجازات الموظفين الشهرية" : "Monthly Leave"
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadUsers();
      toast({
        title: isArabic ? "تم التحديث" : "Refreshed",
        description: isArabic 
          ? "تم تحديث البيانات بنجاح"
          : "Data has been refreshed successfully",
      });
    } catch (error) {
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic 
          ? "حدث خطأ أثناء تحديث البيانات"
          : "An error occurred while refreshing data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return isArabic ? "الآن" : "Just now";
    }
    
    if (diffInMinutes < 60) {
      return isArabic 
        ? `منذ ${diffInMinutes} دقيقة`
        : `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return isArabic 
        ? `منذ ${diffInHours} ساعة`
        : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: !isArabic
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}></div>
          <span className="text-sm text-muted-foreground">
            {isConnected 
              ? (isArabic ? "متصل" : "Connected") 
              : (isArabic ? "غير متصل" : "Disconnected")}
          </span>
          {!isConnected && (
            <Button variant="outline" size="sm" onClick={reconnect}>
              {isArabic ? "إعادة الاتصال" : "Reconnect"}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isArabic ? "تحديث" : "Refresh"}
          </Button>
          <Button onClick={handleCreateUser}>
            {isArabic ? "إضافة مستخدم جديد" : "Add New User"}
          </Button>
        </div>
      </div>

    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isArabic ? "المستخدم" : "User"}</TableHead>
            <TableHead>{isArabic ? "البريد الإلكتروني" : "Email"}</TableHead>
            <TableHead>{isArabic ? "الدور" : "Role"}</TableHead>
            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
            <TableHead>{isArabic ? "آخر تسجيل دخول" : "Last Login"}</TableHead>
            <TableHead className="text-right">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </div>
              </TableCell>
              <TableCell>{user.email || "-"}</TableCell>
              <TableCell>
                <Badge variant={user.role === UserRole.Admin ? "default" : "outline"}>
                  {user.role === UserRole.Admin 
                    ? (isArabic ? "مسؤول" : "Admin") 
                    : (isArabic ? "مستخدم" : "User")}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    user.status === UserStatus.Online ? "bg-green-500" : "bg-gray-300"
                  } mr-2`}></div>
                  {user.status === UserStatus.Online 
                    ? (isArabic ? "متصل" : "Online") 
                    : (isArabic ? "غير متصل" : "Offline")}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{formatLastLogin(user.lastLogin)}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(user.lastLogin).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                      hour12: !isArabic
                    })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                  {isArabic ? "تعديل" : "Edit"}
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                  {isArabic ? "حذف" : "Delete"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "تعديل المستخدم" : "Edit User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="username">{isArabic ? "اسم المستخدم" : "Username"}</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "الدور" : "Role"}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="roleUser"
                    checked={formData.role === UserRole.User}
                    onChange={() => handleRoleChange(UserRole.User)}
                  />
                  <Label htmlFor="roleUser">{isArabic ? "مستخدم" : "User"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="roleAdmin"
                    checked={formData.role === UserRole.Admin}
                    onChange={() => handleRoleChange(UserRole.Admin)}
                  />
                  <Label htmlFor="roleAdmin">{isArabic ? "مسؤول" : "Admin"}</Label>
                </div>
              </div>
            </div>
            {formData.role !== UserRole.Admin && (
              <div className="space-y-2">
                <Label>{isArabic ? "الصلاحيات" : "Permissions"}</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(permissionGroups).map(([group, permissions]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground sticky top-0 bg-background py-1">
                        {groupLabels[group as keyof typeof groupLabels]}
                      </h4>
                      <div className="space-y-2 pl-4">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission, checked as boolean)}
                            />
                            <Label htmlFor={permission}>{permissionLabels[permission]}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveUser}>
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? "إضافة مستخدم جديد" : "Add New User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="new-username">{isArabic ? "اسم المستخدم" : "Username"}</Label>
              <Input
                id="new-username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">{isArabic ? "كلمة المرور" : "Password"}</Label>
              <Input
                id="new-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
              <Input
                id="new-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? "الدور" : "Role"}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="new-roleUser"
                    checked={formData.role === UserRole.User}
                    onChange={() => handleRoleChange(UserRole.User)}
                  />
                  <Label htmlFor="new-roleUser">{isArabic ? "مستخدم" : "User"}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="new-roleAdmin"
                    checked={formData.role === UserRole.Admin}
                    onChange={() => handleRoleChange(UserRole.Admin)}
                  />
                  <Label htmlFor="new-roleAdmin">{isArabic ? "مسؤول" : "Admin"}</Label>
                </div>
              </div>
            </div>
            {formData.role !== UserRole.Admin && (
              <div className="space-y-2">
                <Label>{isArabic ? "الصلاحيات" : "Permissions"}</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {Object.entries(permissionGroups).map(([group, permissions]) => (
                    <div key={group} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground sticky top-0 bg-background py-1">
                        {groupLabels[group as keyof typeof groupLabels]}
                      </h4>
                      <div className="space-y-2 pl-4">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`new-${permission}`}
                              checked={formData.permissions.includes(permission)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission, checked as boolean)}
                            />
                            <Label htmlFor={`new-${permission}`}>{permissionLabels[permission]}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-auto pt-4 border-t">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleCreateNewUser}>
              {isArabic ? "إنشاء" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
