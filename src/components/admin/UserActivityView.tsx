import { useState, useEffect, useMemo } from "react";
import { User, Task, Note } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { useVacations } from "@/context/VacationsContext";
import { Language } from "@/lib/types";
import { format, startOfMonth, endOfMonth } from "date-fns";

interface MonthlyLeaveStatus {
  totalEmployees: number;
  totalAllowance: number;
  totalUsed: number;
  daysLeft: number;
  monthlyLeaves: {
    date: string;
    employeeName: string;
    status: "approved" | "rejected" | "pending";
  }[];
}

const UserActivityView = () => {
  const { language } = useSettings();
  const { user } = useAuth();
  const { employeeData, vacations } = useVacations();
  const isArabic = language === Language.Arabic;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [monthlyLeaveStatus, setMonthlyLeaveStatus] = useState<MonthlyLeaveStatus | null>(null);

  useEffect(() => {
    if (!user) return;
    const allUsers = storage.getUsers();
    setUsers(allUsers);
    if (allUsers.length > 0) {
      setSelectedUser(allUsers[0].id);
    }
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) return;
    
    try {
      const tasks = storage.getTasksByUserId(selectedUser, user);
      const notes = storage.getNotesByUserId(selectedUser, user);
      
      setUserTasks(tasks);
      setUserNotes(notes);

      // Calculate monthly leave status using the same logic as MonthlyVacationsTool
      const currentDate = new Date();
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // Get total number of employees
      const totalEmployees = employeeData.filter(emp => emp.name).length;

      // Calculate total allowance for all employees
      const totalAllowance = employeeData.reduce((sum, emp) => sum + emp.monthlyLeaveAllowance, 0);

      // Get all leaves for the current month
      const monthlyLeaves = Object.entries(vacations)
        .filter(([dateKey]) => {
          const date = new Date(dateKey);
          return date >= monthStart && date <= monthEnd;
        })
        .flatMap(([dateKey, dayVacations]) => 
          dayVacations
            .filter(item => item.text) // Only include leaves with assigned employees
            .map(item => ({
              date: dateKey,
              employeeName: item.text,
              status: "approved" as const // Since these are approved leaves
            }))
        );

      const totalUsed = monthlyLeaves.length;
      const daysLeft = totalAllowance - totalUsed;

      setMonthlyLeaveStatus({
        totalEmployees,
        totalAllowance,
        totalUsed,
        daysLeft,
        monthlyLeaves
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [selectedUser, user, employeeData, vacations]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "bg-green-100 text-green-800";
      case "in_progress":
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    if (isArabic) {
      switch (status) {
        case "completed": return "مكتمل";
        case "in_progress": return "قيد التنفيذ";
        case "approved": return "تمت الموافقة";
        case "rejected": return "مرفوض";
        case "pending": return "قيد الانتظار";
        default: return status;
      }
    }
    return status;
  };

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        {isArabic ? "يرجى تسجيل الدخول" : "Please log in"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={isArabic ? "اختر المستخدم" : "Select User"} />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUser && (
          <div className="text-sm text-muted-foreground">
            {isArabic ? "آخر تحديث: " : "Last updated: "}
            {format(new Date(), "PPP")}
          </div>
        )}
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full overflow-x-auto flex whitespace-nowrap">
          <TabsTrigger value="tasks">
            {isArabic ? "المهام" : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="notes">
            {isArabic ? "الملاحظات" : "Notes"}
          </TabsTrigger>
          <TabsTrigger value="monthlyLeave">
            {isArabic ? "الإجازات الشهرية" : "Monthly Leave"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="space-y-4">
            {userTasks.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {isArabic ? "لا توجد مهام" : "No tasks found"}
              </p>
            ) : (
              userTasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                        <span className="text-muted-foreground">
                          {format(new Date(task.createdAt), "PPP")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="space-y-4">
            {userNotes.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {isArabic ? "لا توجد ملاحظات" : "No notes found"}
              </p>
            ) : (
              userNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {note.content.substring(0, 50)}...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                      <div className="flex justify-end">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(note.createdAt), "PPP")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="monthlyLeave">
          <div className="space-y-6">
            {/* Monthly Leave Summary */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl font-bold">
                    {monthlyLeaveStatus?.totalEmployees || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "عدد الموظفين" : "Number of Employees"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl font-bold text-green-600">
                    {monthlyLeaveStatus?.totalAllowance || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الإجازات المتاحة" : "Available Leaves"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {monthlyLeaveStatus?.totalUsed || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الإجازات المستخدمة" : "Used Leaves"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {monthlyLeaveStatus?.daysLeft || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? "الإجازات المتبقية" : "Remaining Leaves"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Leave Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                {isArabic ? "تفاصيل الإجازات" : "Leave Details"}
              </h3>
              {monthlyLeaveStatus?.monthlyLeaves.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  {isArabic ? "لا توجد إجازات لهذا الشهر" : "No leaves for this month"}
                </p>
              ) : (
                monthlyLeaveStatus?.monthlyLeaves.map((leave, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-sm font-medium">
                            {format(new Date(leave.date), "PPP")}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {leave.employeeName}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                          {getStatusText(leave.status)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivityView; 