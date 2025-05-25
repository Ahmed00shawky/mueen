import { useState } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trash2, 
  Edit2,
  Bell,
  BellOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, TaskStatus, TaskCategory } from "@/lib/types";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
}

const TaskList = ({ tasks, onTaskUpdate, onTaskDelete }: TaskListProps) => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState<TaskCategory>(TaskCategory.UrgentImportant);
  const [editAlarm, setEditAlarm] = useState<Date | null>(null);
  const [editCategoryEnabled, setEditCategoryEnabled] = useState(false);

  const getCategoryColor = (category: TaskCategory): string => {
    switch (category) {
      case TaskCategory.UrgentImportant: return "bg-priority-urgent";
      case TaskCategory.UrgentNotImportant: return "bg-priority-high";
      case TaskCategory.NotUrgentImportant: return "bg-priority-medium";
      case TaskCategory.NotUrgentNotImportant: return "bg-priority-low";
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === TaskStatus.Completed 
      ? TaskStatus.Todo 
      : TaskStatus.Completed;
      
    onTaskUpdate({
      ...task,
      status: newStatus,
      updatedAt: new Date()
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditCategory(task.category);
    setEditAlarm(task.alarm ? new Date(task.alarm) : null);
    setEditCategoryEnabled(false);
  };

  const handleSaveEdit = () => {
    if (editingTask) {
      onTaskUpdate({
        ...editingTask,
        title: editTitle,
        description: editDescription,
        category: editCategoryEnabled ? editCategory : editingTask.category,
        priorityColor: editCategoryEnabled ? getCategoryColor(editCategory) : editingTask.priorityColor,
        alarm: editAlarm,
        updatedAt: new Date()
      });
      setEditingTask(null);
    }
  };

  const handleToggleAlarm = (task: Task) => {
    onTaskUpdate({
      ...task,
      alarm: task.alarm ? null : new Date(Date.now() + 30 * 60000), // Default to 30 minutes from now
      updatedAt: new Date()
    });
  };

  // Sort tasks by their order property
  const displayTasks = [...tasks].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });

  if (tasks.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">No tasks yet. Add your first task to get started!</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[400px] sm:h-[500px]">
      <div className="space-y-2 p-1">
        {displayTasks.map((task) => (
          <div
            key={task.id}
            className="flex flex-col sm:flex-row items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card relative"
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${task.priorityColor}`} />
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => handleToggleStatus(task)}
              >
                {task.status === TaskStatus.Completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                  {editingTask?.id === task.id ? (
                    <div className="space-y-2 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                        placeholder={isArabic ? "عنوان المهمة" : "Task Title"}
                      />
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 resize-none"
                        rows={2}
                        placeholder={isArabic ? "وصف المهمة" : "Task Description"}
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit-category"
                            checked={editCategoryEnabled}
                            onCheckedChange={setEditCategoryEnabled}
                            className="data-[state=checked]:bg-primary"
                          />
                          <Label htmlFor="edit-category" className="text-foreground">
                            {isArabic ? "تعديل الفئة" : "Edit Category"}
                          </Label>
                        </div>
                        {editCategoryEnabled && (
                          <Select 
                            value={editCategory} 
                            onValueChange={(value) => setEditCategory(value as TaskCategory)}
                          >
                            <SelectTrigger className="bg-background text-foreground border-input focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder={isArabic ? "اختر الفئة" : "Select Category"} />
                            </SelectTrigger>
                            <SelectContent className="bg-background text-foreground border-input">
                              <SelectItem value={TaskCategory.UrgentImportant} className="focus:bg-accent focus:text-accent-foreground">
                                {isArabic ? "عاجل ومهم" : "Urgent & Important"}
                              </SelectItem>
                              <SelectItem value={TaskCategory.UrgentNotImportant} className="focus:bg-accent focus:text-accent-foreground">
                                {isArabic ? "عاجل وغير مهم" : "Urgent & Not Important"}
                              </SelectItem>
                              <SelectItem value={TaskCategory.NotUrgentImportant} className="focus:bg-accent focus:text-accent-foreground">
                                {isArabic ? "غير عاجل ومهم" : "Not Urgent & Important"}
                              </SelectItem>
                              <SelectItem value={TaskCategory.NotUrgentNotImportant} className="focus:bg-accent focus:text-accent-foreground">
                                {isArabic ? "غير عاجل وغير مهم" : "Not Urgent & Not Important"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex items-center gap-2">
                          <input
                            type="datetime-local"
                            value={editAlarm ? format(editAlarm, "yyyy-MM-dd'T'HH:mm") : ""}
                            onChange={(e) => setEditAlarm(e.target.value ? new Date(e.target.value) : null)}
                            className="p-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                          />
                          {editAlarm && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditAlarm(null)}
                              className="hover:bg-accent hover:text-accent-foreground"
                            >
                              <BellOff className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit} className="bg-primary text-primary-foreground hover:bg-primary/90">
                          {isArabic ? "حفظ" : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)} className="hover:bg-accent hover:text-accent-foreground">
                          {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className={`font-medium truncate ${
                        task.status === TaskStatus.Completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}>
                        {task.title}
                      </p>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground truncate mt-1">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-accent/10 px-2 py-1 rounded-md">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(task.dueDate), "PPP")}</span>
                          </div>
                        )}
                        {task.alarm && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1 bg-accent/10 px-2 py-1 rounded-md">
                            <Bell className="h-3 w-3" />
                            <span>{format(new Date(task.alarm), "PPp")}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-center ml-auto">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(task)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleToggleAlarm(task)}
              >
                {task.alarm ? (
                  <Bell className="h-4 w-4 text-yellow-500" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onTaskDelete(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default TaskList;
