import { useState } from "react";
import { Task, TaskStatus, TaskCategory } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";
import TaskList from "@/components/tasks/TaskList";
import TaskMatrix from "@/components/tasks/TaskMatrix";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TodoToolProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
}

const TodoTool = ({ tasks, onTaskUpdate, onTaskCreate, onTaskDelete }: TodoToolProps) => {
  const { user } = useAuth();
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  
  const [activeTab, setActiveTab] = useState<"list" | "matrix">("list");
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: TaskCategory.UrgentImportant,
  });

  const handleCreateTask = () => {
    if (!user || !newTask.title.trim()) return;
    
    const task: Task = {
      id: uuidv4(),
      userId: user.id,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      category: newTask.category,
      status: TaskStatus.Todo,
      priorityColor: getCategoryColor(newTask.category),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    onTaskCreate(task);
    setNewTask({
      title: "",
      description: "",
      category: TaskCategory.UrgentImportant,
    });
    setIsCreating(false);
  };

  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.UrgentImportant: return "bg-priority-urgent";
      case TaskCategory.UrgentNotImportant: return "bg-priority-high";
      case TaskCategory.NotUrgentImportant: return "bg-priority-medium";
      case TaskCategory.NotUrgentNotImportant: return "bg-priority-low";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isArabic ? "قائمة المهام" : "To Do List"}
        </h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
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

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="list">{isArabic ? "قائمة" : "List"}</TabsTrigger>
          <TabsTrigger value="matrix">{isArabic ? "مصفوفة" : "Matrix"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <TaskList 
            tasks={tasks} 
            onTaskUpdate={onTaskUpdate} 
            onTaskDelete={onTaskDelete}
          />
        </TabsContent>
        
        <TabsContent value="matrix">
          <TaskMatrix
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={onTaskCreate}
            onTaskDelete={onTaskDelete}
          />
        </TabsContent>
      </Tabs>

      <Card className="p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="mb-1">
              {isArabic
                ? "مصفوفة أيزنهاور هي أداة مفيدة لتحديد أولويات المهام."
                : "The Eisenhower Matrix is a useful tool for task prioritization."}
            </p>
            <p>
              {isArabic
                ? "استخدمها لتقسيم المهام إلى أربع فئات بناءً على العجلة والأهمية."
                : "Use it to categorize tasks into four quadrants based on urgency and importance."}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TodoTool;
