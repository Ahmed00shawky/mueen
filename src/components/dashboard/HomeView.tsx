import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Task, Note, TaskStatus, TaskCategory } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TaskList from "@/components/tasks/TaskList";
import NoteList from "@/components/notes/NoteList";
import TaskMatrix from "@/components/tasks/TaskMatrix";

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
  const [activeTab, setActiveTab] = useState<"tasks" | "matrix" | "notes">("tasks");
  
  const isArabic = language === Language.Arabic;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Tabs for Tasks, Matrix, and Notes */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="tasks">{isArabic ? "المهام" : "Tasks"}</TabsTrigger>
          <TabsTrigger value="matrix">{isArabic ? "المصفوفة" : "Matrix"}</TabsTrigger>
          <TabsTrigger value="notes">{isArabic ? "الملاحظات" : "Notes"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {isArabic ? "قائمة المهام" : "To Do List"}
            </h3>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const newTask: Task = {
                    id: Date.now().toString(),
                    title: "",
                    description: "",
                    status: TaskStatus.Todo,
                    category: TaskCategory.UrgentImportant,
                    priorityColor: "#ef4444",
                    dueDate: new Date(),
                    userId: "user", // Replace with actual user ID
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };
                  onTaskCreate(newTask);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                {isArabic ? "مهمة جديدة" : "New Task"}
              </Button>
            </div>
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
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              {isArabic ? "ملاحظة جديدة" : "New Note"}
            </Button>
          </div>
          
          <NoteList
            notes={notes}
            onNoteUpdate={onNoteUpdate}
            onNoteDelete={onNoteDelete}
          />
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
