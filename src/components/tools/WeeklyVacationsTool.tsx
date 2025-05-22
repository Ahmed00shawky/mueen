import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";
import { useVacations } from "@/context/VacationsContext";
import { Language } from "@/lib/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface VacationItem {
  id: string;
  text: string;
}

// Employee colors for visual tracking
const EMPLOYEE_COLORS = [
  'text-blue-600',
  'text-purple-600',
  'text-green-600',
  'text-orange-600'
];

const WeeklyVacationsTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const locale = isArabic ? ar : enUS;
  const { 
    employeeNames, 
    setEmployeeNames, 
    employeeCounts, 
    vacations, 
    setVacations 
  } = useVacations();

  // Get the start and end of the current month
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(monthStart);
  
  // Get all days in the month
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate the number of days to add at the start to align with the first day of the week
  const startDay = getDay(monthStart);
  const daysToAdd = startDay;
  
  // Add empty days at the start to align with the first day of the week
  const calendarDays = [
    ...Array(daysToAdd).fill(null),
    ...monthDays
  ];

  // Handle employee name change
  const handleEmployeeNameChange = (index: number, value: string) => {
    const newNames = [...employeeNames];
    newNames[index] = value;
    setEmployeeNames(newNames);
  };

  // Handle adding a new vacation item
  const handleAddVacation = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentItems = vacations[dateKey] || [];
    
    if (currentItems.length < 2) {
      const newItem: VacationItem = {
        id: `vacation-${Date.now()}`,
        text: ''
      };
      
      setVacations({
        ...vacations,
        [dateKey]: [...currentItems, newItem]
      });
    }
  };

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceDate = source.droppableId;
    const destDate = destination.droppableId;
    const sourceItems = [...vacations[sourceDate]];
    const destItems = sourceDate === destDate ? sourceItems : [...vacations[destDate]];

    // Check if destination already has 2 items
    if (sourceDate !== destDate && destItems.length >= 2) return;

    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    setVacations({
      ...vacations,
      [sourceDate]: sourceItems,
      [destDate]: destItems
    });
  };

  // Handle text change
  const handleTextChange = (date: string, itemId: string, newText: string) => {
    setVacations({
      ...vacations,
      [date]: vacations[date].map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      )
    });
  };

  // Get day names for the header
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfMonth(new Date()), i);
    return format(day, 'EEEE', { locale });
  });

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Employee Names Section - Top on mobile, Left on desktop */}
          <div className="w-full md:w-64">
            <div className="md:sticky md:top-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? "أسماء الموظفين" : "Employee Names"}
              </h3>
              {employeeNames.map((name, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      {isArabic ? `موظف ${index + 1}` : `Employee ${index + 1}`}
                    </label>
                    <span className={cn("text-sm font-medium", 
                      employeeCounts[index] < 4 ? 'text-yellow-600' :
                      employeeCounts[index] === 4 ? 'text-green-600' :
                      'text-red-600'
                    )}>
                      {employeeCounts[index]} {isArabic ? "مرة" : "times"}
                    </span>
                  </div>
                  <Input
                    value={name}
                    onChange={(e) => handleEmployeeNameChange(index, e.target.value)}
                    placeholder={isArabic ? "أدخل اسم الموظف..." : "Enter employee name..."}
                    className={cn("w-full", EMPLOYEE_COLORS[index])}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Calendar - Below on mobile, Right on desktop */}
          <div className="flex-1">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-4">
                {/* Month and Year Header */}
                <div className="text-center text-2xl font-semibold mb-4">
                  {format(monthStart, 'MMMM yyyy', { locale })}
                </div>

                {/* Calendar Container */}
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[1000px]">
                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {dayNames.map((dayName, index) => (
                        <div key={index} className="text-center font-medium text-muted-foreground text-sm">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, index) => {
                        if (!day) {
                          return <div key={`empty-${index}`} className="relative w-full pb-[100%]" />;
                        }

                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayVacations = vacations[dateKey] || [];

                        return (
                          <Card 
                            key={dateKey} 
                            className="relative w-full pb-[100%]"
                          >
                            <div className="absolute inset-0 p-2 flex flex-col">
                              <div className="text-center mb-1">
                                <div className="font-medium text-sm">
                                  {format(day, 'd')}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {format(day, 'MMM', { locale })}
                                </div>
                              </div>

                              <Droppable droppableId={dateKey}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex-1 min-h-0 space-y-1.5"
                                  >
                                    {dayVacations.map((item, index) => (
                                      <Draggable key={item.id} draggableId={item.id} index={index}>
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`p-1 rounded-md border ${
                                              snapshot.isDragging ? 'bg-accent' : 'bg-background'
                                            }`}
                                          >
                                            <Select
                                              value={item.text}
                                              onValueChange={(value) => handleTextChange(dateKey, item.id, value)}
                                            >
                                              <SelectTrigger className={cn("h-7 text-xs", EMPLOYEE_COLORS[employeeNames.indexOf(item.text)])}>
                                                <SelectValue placeholder={isArabic ? "اختر موظف..." : "Select employee..."} />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {employeeNames.map((name, idx) => (
                                                  name && (
                                                    <SelectItem key={idx} value={name} className={EMPLOYEE_COLORS[idx]}>
                                                      {name}
                                                    </SelectItem>
                                                  )
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {dayVacations.length < 2 && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full h-7 text-xs"
                                        onClick={() => handleAddVacation(day)}
                                      >
                                        {isArabic ? "إضافة" : "Add"}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </Droppable>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyVacationsTool; 