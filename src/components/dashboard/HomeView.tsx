import { useState, useMemo } from "react";
import { Plus, Clock, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task, Note, TaskStatus, TaskCategory } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskList from "@/components/tasks/TaskList";
import NoteList from "@/components/notes/NoteList";
import TaskMatrix from "@/components/tasks/TaskMatrix";
import { useVacations } from "@/context/VacationsContext";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface HomeViewProps {
  tasks: Task[];
  notes: Note[];
  taskStats: {
    total: number;
    completed: number;
    remaining: number;
  };
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onNoteUpdate: (note: Note) => void;
  onNoteCreate: (note: Note) => void;
  onNoteDelete: (id: string) => void;
}

const HomeView = ({
  tasks,
  notes,
  taskStats,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onNoteUpdate,
  onNoteCreate,
  onNoteDelete,
}: HomeViewProps) => {
  const { language } = useSettings();
  const { employeeData, monthlyEmployeeData, vacations } = useVacations();
  const [activeTab, setActiveTab] = useState<"tasks" | "matrix" | "notes" | "monthlyLeave">("tasks");
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: TaskCategory.UrgentImportant,
  });
  const [newNote, setNewNote] = useState({
    content: "",
  });
  const isArabic = language === Language.Arabic;

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      status: TaskStatus.Todo,
      category: newTask.category,
      priorityColor: getCategoryColor(newTask.category),
      userId: "user",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onTaskCreate(task);
    setNewTask({
      title: "",
      description: "",
      category: TaskCategory.UrgentImportant,
    });
    setIsCreating(false);
  };

  const handleCreateNote = () => {
    if (!newNote.content.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.content.trim(),
      userId: "user",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    onNoteCreate(note);
    setNewNote({
      content: "",
    });
    setIsCreatingNote(false);
  };

  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.UrgentImportant: return "bg-priority-urgent";
      case TaskCategory.UrgentNotImportant: return "bg-priority-high";
      case TaskCategory.NotUrgentImportant: return "bg-priority-medium";
      case TaskCategory.NotUrgentNotImportant: return "bg-priority-low";
    }
  };

  // Calculate monthly leave status for current month
  const monthlyLeaveStatus = useMemo(() => {
    const currentDate = new Date();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthKey = format(monthStart, 'yyyy-MM');

    // Get current month's employees
    const currentMonthEmployees = monthlyEmployeeData[monthKey] || employeeData;

    const totalEmployees = currentMonthEmployees.filter(emp => emp.name).length;
    const totalAllowance = currentMonthEmployees.reduce((sum, emp) => sum + emp.monthlyLeaveAllowance, 0);
    
    // Only count leaves for the current month
    const totalUsed = Object.entries(vacations).reduce((sum, [dateKey, dayVacations]) => {
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        return sum + dayVacations.filter(item => item.text).length;
      }
      return sum;
    }, 0);

    // Calculate remaining leaves
    const daysLeft = totalAllowance - totalUsed;

    return {
      totalEmployees,
      totalAllowance,
      totalUsed,
      daysLeft
    };
  }, [employeeData, monthlyEmployeeData, vacations]);

  return (
    <div className="space-y-6">
      {/* Tabs for Tasks, Matrix, Notes, and Monthly Leave */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="tasks">{isArabic ? "المهام" : "Tasks"}</TabsTrigger>
          <TabsTrigger value="matrix">{isArabic ? "المصفوفة" : "Matrix"}</TabsTrigger>
          <TabsTrigger value="notes">{isArabic ? "الملاحظات" : "Notes"}</TabsTrigger>
          <TabsTrigger value="monthlyLeave">
            <Calendar className="h-4 w-4 mr-1" />
            {isArabic ? "الإجازات الشهرية" : "Monthly Leave"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          {/* Task Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold">{taskStats.total}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "إجمالي المهام" : "Total Tasks"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold text-green-600">{taskStats.completed}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "مهام مكتملة" : "Completed"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold text-amber-600">{taskStats.remaining}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "مهام متبقية" : "Remaining"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {isArabic ? "قائمة المهام" : "To Do List"}
            </h3>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  {isArabic ? "مهمة جديدة" : "New Task"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isArabic ? "مهمة جديدة" : "New Task"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "العنوان" : "Title"}
                    </label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder={isArabic ? "أدخل عنوان المهمة" : "Enter task title"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "الوصف" : "Description"}
                    </label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder={isArabic ? "أدخل وصف المهمة" : "Enter task description"}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "الفئة" : "Category"}
                    </label>
                    <Select
                      value={newTask.category}
                      onValueChange={(value) => setNewTask({ ...newTask, category: value as TaskCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select category"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TaskCategory.UrgentImportant}>
                          {isArabic ? "عاجل ومهم" : "Urgent & Important"}
                        </SelectItem>
                        <SelectItem value={TaskCategory.UrgentNotImportant}>
                          {isArabic ? "عاجل وغير مهم" : "Urgent & Not Important"}
                        </SelectItem>
                        <SelectItem value={TaskCategory.NotUrgentImportant}>
                          {isArabic ? "غير عاجل ومهم" : "Not Urgent & Important"}
                        </SelectItem>
                        <SelectItem value={TaskCategory.NotUrgentNotImportant}>
                          {isArabic ? "غير عاجل وغير مهم" : "Not Urgent & Not Important"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreating(false)}>
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button onClick={handleCreateTask}>
                      {isArabic ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <TaskList
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        </TabsContent>
        
        <TabsContent value="matrix" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {isArabic ? "مصفوفة أيزنهاور" : "Eisenhower Matrix"}
            </h3>
          </div>
          
          <TaskMatrix
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={onTaskCreate}
            onTaskDelete={onTaskDelete}
          />
        </TabsContent>
        
        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {isArabic ? "الملاحظات" : "Notes"}
            </h3>
            <Dialog open={isCreatingNote} onOpenChange={setIsCreatingNote}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  {isArabic ? "ملاحظة جديدة" : "New Note"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isArabic ? "ملاحظة جديدة" : "New Note"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isArabic ? "المحتوى" : "Content"}
                    </label>
                    <Textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder={isArabic ? "أدخل محتوى الملاحظة" : "Enter note content"}
                      rows={5}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreatingNote(false)}>
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button onClick={handleCreateNote}>
                      {isArabic ? "إضافة" : "Add"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <NoteList
            notes={notes}
            onNoteUpdate={onNoteUpdate}
            onNoteDelete={onNoteDelete}
          />
        </TabsContent>

        <TabsContent value="monthlyLeave" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold">{monthlyLeaveStatus.totalEmployees}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "عدد الموظفين" : "Number of Employees"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold text-green-600">{monthlyLeaveStatus.totalAllowance}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "الإجازات المتاحة" : "Available Leaves"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold text-orange-600">{monthlyLeaveStatus.totalUsed}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "الإجازات المستخدمة" : "Used Leaves"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center">
                <div className="text-3xl font-bold text-blue-600">{monthlyLeaveStatus.daysLeft}</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? "الإجازات المتبقية" : "Remaining Leaves"}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Current Time and Date */}
      <Card>
        <CardContent className="p-4 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {new Date().toLocaleString(isArabic ? 'ar-SA' : 'en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

export default HomeView;
