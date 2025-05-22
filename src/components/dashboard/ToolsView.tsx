import { useState } from "react";
import { 
  ListChecks, 
  Calculator, 
  Calendar, 
  FileText, 
  Clock, 
  CalendarDays,
  Plane
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Task, Note } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import TodoTool from "@/components/tools/TodoTool";
import CalculatorTool from "@/components/tools/CalculatorTool";
import DateConverterTool from "@/components/tools/DateConverterTool";
import TimeCalculatorTool from "@/components/tools/TimeCalculatorTool";
import CalendarTool from "@/components/tools/CalendarTool";
import NotepadTool from "@/components/tools/NotepadTool";
import WeeklyVacationsTool from "@/components/tools/WeeklyVacationsTool";

interface ToolsViewProps {
  tasks: Task[];
  notes: Note[];
  onTaskUpdate: (task: Task) => void;
  onTaskCreate: (task: Task) => void;
  onTaskDelete: (id: string) => void;
  onNoteUpdate: (note: Note) => void;
  onNoteCreate: (note: Note) => void;
  onNoteDelete: (id: string) => void;
}

type ToolType = 
  | "todo"
  | "calculator"
  | "dateConverter" 
  | "timeCalculator" 
  | "calendar" 
  | "notepad"
  | "weeklyVacations";

const ToolsView = ({
  tasks,
  notes,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  onNoteUpdate,
  onNoteCreate,
  onNoteDelete,
}: ToolsViewProps) => {
  const { language } = useSettings();
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  
  const isArabic = language === Language.Arabic;

  const toolsList = [
    { 
      id: "todo" as ToolType, 
      name: isArabic ? "قائمة المهام" : "To Do List",
      icon: <ListChecks className="h-6 w-6" /> 
    },
    { 
      id: "calculator" as ToolType, 
      name: isArabic ? "الحاسبة" : "Calculator",
      icon: <Calculator className="h-6 w-6" /> 
    },
    { 
      id: "dateConverter" as ToolType, 
      name: isArabic ? "تحويل التاريخ" : "Date Converter",
      icon: <CalendarDays className="h-6 w-6" /> 
    },
    { 
      id: "timeCalculator" as ToolType, 
      name: isArabic ? "حاسبة الوقت" : "Time Calculator",
      icon: <Clock className="h-6 w-6" /> 
    },
    { 
      id: "calendar" as ToolType, 
      name: isArabic ? "التقويم" : "Calendar",
      icon: <Calendar className="h-6 w-6" /> 
    },
    { 
      id: "notepad" as ToolType, 
      name: isArabic ? "المفكرة" : "Notepad",
      icon: <FileText className="h-6 w-6" /> 
    },
    { 
      id: "weeklyVacations" as ToolType, 
      name: isArabic ? "الإجازات الأسبوعية" : "Weekly Leave",
      icon: <Plane className="h-6 w-6" /> 
    }
  ];

  const renderActiveTool = () => {
    switch (activeTool) {
      case "todo":
        return (
          <TodoTool
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={onTaskCreate}
            onTaskDelete={onTaskDelete}
          />
        );
      case "calculator":
        return <CalculatorTool />;
      case "dateConverter":
        return <DateConverterTool />;
      case "timeCalculator":
        return <TimeCalculatorTool />;
      case "calendar":
        return <CalendarTool />;
      case "notepad":
        return (
          <NotepadTool
            notes={notes}
            onNoteUpdate={onNoteUpdate}
            onNoteCreate={onNoteCreate}
            onNoteDelete={onNoteDelete}
          />
        );
      case "weeklyVacations":
        return <WeeklyVacationsTool />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
            <p className="mb-2 text-lg">{isArabic ? "اختر أداة للبدء" : "Select a tool to start"}</p>
            <p className="text-sm">{isArabic ? "اضغط على أي أداة من القائمة أعلاه" : "Click on any tool from the grid above"}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {toolsList.map((tool) => (
          <Card 
            key={tool.id} 
            className={`cursor-pointer hover:bg-muted transition-colors p-4 flex flex-col items-center justify-center gap-2 ${
              activeTool === tool.id ? "border-primary border-2" : ""
            }`}
            onClick={() => setActiveTool(tool.id)}
          >
            {tool.icon}
            <span className="text-sm font-medium text-center">{tool.name}</span>
          </Card>
        ))}
      </div>

      <div className="bg-background border rounded-lg p-4">
        {activeTool && (
          <h3 className="text-lg font-medium mb-4">
            {toolsList.find(tool => tool.id === activeTool)?.name}
          </h3>
        )}
        {renderActiveTool()}
      </div>
    </div>
  );
};

export default ToolsView;
