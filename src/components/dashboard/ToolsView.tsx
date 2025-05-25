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
      icon: <ListChecks className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
    },
    { 
      id: "dateConverter" as ToolType, 
      name: isArabic ? "تحويل التاريخ" : "Date Converter",
      icon: <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
    },
    { 
      id: "timeCalculator" as ToolType, 
      name: isArabic ? "حاسبة الوقت" : "Time Calculator",
      icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
    },
    { 
      id: "notepad" as ToolType, 
      name: isArabic ? "المفكرة" : "Notepad",
      icon: <FileText className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    },
    { 
      id: "monthlyVacations" as ToolType, 
      name: isArabic ? "الإجازات الشهرية" : "Monthly Leave",
      icon: <Plane className="h-5 w-5 sm:h-6 sm:w-6" />,
      color: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
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
    <div className="w-full min-h-screen bg-background">
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        {toolsList.map((tool) => (
          <Card 
            key={tool.id} 
            className={cn(
              "min-h-[90px] cursor-pointer transition-all duration-200 p-4 flex flex-col items-center justify-center gap-2 rounded-lg",
              tool.color,
              activeTool === tool.id && "ring-2 ring-offset-2 ring-primary"
            )}
            onClick={() => setActiveTool(tool.id)}
          >
            {tool.icon}
            <span className="text-sm font-medium text-center">{tool.name}</span>
          </Card>
        ))}
      </div>

      {/* Mobile Vertical Stack View */}
      <div className="md:hidden w-full min-h-screen bg-background flex flex-col items-center">
        <div className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 border-b">
          <h2 className="text-lg font-semibold text-center">
            {isArabic ? "الأدوات" : "Tools"}
          </h2>
        </div>
        
        <div className="w-full max-w-md px-4 py-3 space-y-3">
          {toolsList.map((tool) => (
            <div key={tool.id} className="w-full">
              <button
                onClick={() => setExpandedTool(expandedTool === tool.id ? null : tool.id)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                  tool.color,
                  expandedTool === tool.id && "rounded-b-none"
                )}
              >
                <div className="flex items-center gap-2">
                  {tool.icon}
                  <span className="font-medium text-sm">{tool.name}</span>
                </div>
                <div className={cn(
                  "transition-transform duration-200",
                  expandedTool === tool.id && "rotate-180"
                )}>
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>
              
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  expandedTool === tool.id ? "max-h-[2000px]" : "max-h-0"
                )}
              >
                <Card className="p-3 rounded-t-none border-t-0">
                  <div className="w-full">
                    {renderTool(tool.id)}
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Tool Content */}
      <div className="hidden md:block bg-background border rounded-lg p-4 m-4">
        {activeTool && (
          <div className="flex items-center gap-2 mb-4">
            {toolsList.find(tool => tool.id === activeTool)?.icon}
            <h3 className="text-lg font-medium">
              {toolsList.find(tool => tool.id === activeTool)?.name}
            </h3>
          </div>
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
