import { useState } from "react";
import { 
  ListChecks, 
  FileText, 
  Clock, 
  CalendarDays,
  Plane,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Task, Note } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import TodoTool from "@/components/tools/TodoTool";
import DateConverterTool from "@/components/tools/DateConverterTool";
import TimeCalculatorTool from "@/components/tools/TimeCalculatorTool";
import NotepadTool from "@/components/tools/NotepadTool";
import MonthlyVacationsTool from "@/components/tools/MonthlyVacationsTool";
import { cn } from "@/lib/utils";

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
  | "dateConverter" 
  | "timeCalculator" 
  | "notepad"
  | "monthlyVacations";

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
  const [expandedTool, setExpandedTool] = useState<ToolType | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const isArabic = language === Language.Arabic;

  const toolsList = [
    { 
      id: "todo" as ToolType, 
      name: isArabic ? "قائمة المهام" : "To Do List",
      icon: <ListChecks className="h-6 w-6" /> 
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
      id: "notepad" as ToolType, 
      name: isArabic ? "المفكرة" : "Notepad",
      icon: <FileText className="h-6 w-6" /> 
    },
    { 
      id: "monthlyVacations" as ToolType, 
      name: isArabic ? "الإجازات الشهرية" : "Monthly Leave",
      icon: <Plane className="h-6 w-6" /> 
    }
  ];

  const renderTool = (toolId: ToolType) => {
    switch (toolId) {
      case "todo":
        return (
          <TodoTool
            tasks={tasks}
            onTaskUpdate={onTaskUpdate}
            onTaskCreate={onTaskCreate}
            onTaskDelete={onTaskDelete}
          />
        );
      case "dateConverter":
        return <DateConverterTool />;
      case "timeCalculator":
        return <TimeCalculatorTool />;
      case "notepad":
        return (
          <NotepadTool
            notes={notes}
            onNoteUpdate={onNoteUpdate}
            onNoteCreate={onNoteCreate}
            onNoteDelete={onNoteDelete}
          />
        );
      case "monthlyVacations":
        return <MonthlyVacationsTool />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {toolsList.map((tool) => (
          <Card 
            key={tool.id} 
            className={cn(
              "min-h-[90px] cursor-pointer hover:bg-muted transition-colors p-4 flex flex-col items-center justify-center gap-2 rounded-lg",
              activeTool === tool.id && "border-primary border-2"
            )}
            onClick={() => setActiveTool(tool.id)}
          >
            {tool.icon}
            <span className="text-sm font-medium text-center">{tool.name}</span>
          </Card>
        ))}
      </div>

      {/* Mobile Collapsible View */}
      <div className="md:hidden space-y-4">
        {toolsList.map((tool) => (
          <div key={tool.id} className="space-y-2">
            <button
              onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
              className="w-full flex items-center justify-between p-4 bg-card rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                {tool.icon}
                <span className="font-medium">{tool.name}</span>
              </div>
              {expandedTool === tool.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            
            <div
              className={cn(
                "overflow-hidden transition-all duration-200",
                expandedTool === tool.id ? "max-h-[2000px]" : "max-h-0"
              )}
            >
              <Card className="p-4">
                {renderTool(tool.id)}
              </Card>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Tool Content */}
      <div className="hidden md:block bg-background border rounded-lg p-4">
        {activeTool && (
          <h3 className="text-lg font-medium mb-4">
            {toolsList.find(tool => tool.id === activeTool)?.name}
          </h3>
        )}
        {activeTool ? renderTool(activeTool) : (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
            <p className="mb-2 text-lg">{isArabic ? "اختر أداة للبدء" : "Select a tool to start"}</p>
            <p className="text-sm">{isArabic ? "اضغط على أي أداة من القائمة أعلاه" : "Click on any tool from the grid above"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolsView;
