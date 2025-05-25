import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Task, Note, Notification, TaskCategory, UserStatus } from "@/lib/types";
import { storage } from "@/lib/storage";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { Language } from "@/lib/types";
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  Pie,
  PieChart,
  Cell
} from "recharts";

const AppStats = () => {
  const { language } = useSettings();
  const { user } = useAuth();
  const isArabic = language === Language.Arabic;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTasks: 0,
    totalNotes: 0,
    totalNotifications: 0,
    activeUsers: 0,
  });
  
  const [userActivityData, setUserActivityData] = useState<any[]>([]);
  const [taskDistributionData, setTaskDistributionData] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user) return;

    const users = storage.getUsers();
    const notifications = storage.getNotifications();
    
    // Get all tasks and notes for each user
    const allTasks: Task[] = [];
    const allNotes: Note[] = [];
    
    users.forEach(user => {
      const userTasks = storage.getTasksByUserId(user.id, user);
      const userNotes = storage.getNotesByUserId(user.id, user);
      allTasks.push(...userTasks);
      allNotes.push(...userNotes);
    });
    
    // Calculate basic stats
    setStats({
      totalUsers: users.length,
      totalTasks: allTasks.length,
      totalNotes: allNotes.length,
      totalNotifications: notifications.length,
      activeUsers: users.filter(user => user.status === UserStatus.Online).length,
    });
    
    // Generate user activity data
    const userData = users.map(user => {
      const userTasks = allTasks.filter(task => task.userId === user.id).length;
      const userNotes = allNotes.filter(note => note.userId === user.id).length;
      
      return {
        name: user.username,
        tasks: userTasks,
        notes: userNotes,
      };
    });
    
    setUserActivityData(userData);
    
    // Generate task distribution data
    const tasksByCategory = allTasks.reduce((acc: Record<string, number>, task) => {
      const category = task.category || TaskCategory.NotUrgentNotImportant;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    const taskDistribution = Object.entries(tasksByCategory).map(([category, count]) => {
      let name = "";
      
      switch (category) {
        case TaskCategory.UrgentImportant:
          name = isArabic ? "عاجل ومهم" : "Urgent & Important";
          break;
        case TaskCategory.UrgentNotImportant:
          name = isArabic ? "عاجل وغير مهم" : "Urgent & Not Important";
          break;
        case TaskCategory.NotUrgentImportant:
          name = isArabic ? "غير عاجل ومهم" : "Not Urgent & Important";
          break;
        case TaskCategory.NotUrgentNotImportant:
          name = isArabic ? "غير عاجل وغير مهم" : "Not Urgent & Not Important";
          break;
        default:
          name = category;
      }
      
      return { name, value: count };
    });
    
    setTaskDistributionData(taskDistribution);
    
  }, [isArabic, user]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{stats.totalUsers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "إجمالي المستخدمين" : "Total Users"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{stats.totalTasks}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "إجمالي المهام" : "Total Tasks"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{stats.totalNotes}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "إجمالي الملاحظات" : "Total Notes"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{stats.activeUsers}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "المستخدمين النشطين" : "Active Users"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold">{stats.totalNotifications}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? "إجمالي الإشعارات" : "Total Notifications"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? "نشاط المستخدمين" : "User Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userActivityData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="tasks" name={isArabic ? "المهام" : "Tasks"} fill="#3b82f6" />
                  <Bar dataKey="notes" name={isArabic ? "الملاحظات" : "Notes"} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? "توزيع المهام" : "Task Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppStats;
