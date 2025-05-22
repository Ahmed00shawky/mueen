import { useState, useEffect } from "react";
import { User, Task, Note } from "@/lib/types";
import { storage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { format } from "date-fns";

interface Leave {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "approved" | "rejected" | "pending";
}

const UserActivityView = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [userNotes, setUserNotes] = useState<Note[]>([]);
  const [userLeaves, setUserLeaves] = useState<Leave[]>([]);

  useEffect(() => {
    const allUsers = storage.getUsers();
    setUsers(allUsers);
    if (allUsers.length > 0) {
      setSelectedUser(allUsers[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const tasks = storage.getTasksByUserId(selectedUser);
      const notes = storage.getNotesByUserId(selectedUser);
      const leaves = storage.getLeavesByUserId(selectedUser);
      setUserTasks(tasks);
      setUserNotes(notes);
      setUserLeaves(leaves);
    }
  }, [selectedUser]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[200px]">
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
        <TabsList>
          <TabsTrigger value="tasks">
            {isArabic ? "المهام" : "Tasks"}
          </TabsTrigger>
          <TabsTrigger value="notes">
            {isArabic ? "الملاحظات" : "Notes"}
          </TabsTrigger>
          <TabsTrigger value="leaves">
            {isArabic ? "الإجازات" : "Leaves"}
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

        <TabsContent value="leaves">
          <div className="space-y-4">
            {userLeaves.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {isArabic ? "لا توجد إجازات" : "No leaves found"}
              </p>
            ) : (
              userLeaves.map((leave) => (
                <Card key={leave.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {isArabic ? "طلب إجازة" : "Leave Request"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {format(new Date(leave.startDate), "PPP")} - {format(new Date(leave.endDate), "PPP")}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                          {getStatusText(leave.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{leave.reason}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserActivityView; 