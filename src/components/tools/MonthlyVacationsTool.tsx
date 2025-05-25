import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";
import { useVacations } from "@/context/VacationsContext";
import { Language } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface VacationItem {
  id: string;
  text: string;
}

interface MonthlyEmployee {
  name: string;
  monthlyLeaveAllowance: number;
}

type VacationsType = Record<string, VacationItem[]>;

// Employee colors for visual tracking
const EMPLOYEE_COLORS = [
  'text-blue-600',
  'text-purple-600',
  'text-green-600',
  'text-orange-600'
];

const MonthlyVacationsTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const locale = isArabic ? ar : enUS;
  const { 
    employeeData, 
    monthlyEmployeeData,
    setMonthlyEmployeeData,
    vacations, 
    setVacations 
  } = useVacations();

  // Add state for current month
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get the start and end of the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  
  // Get month key for storage
  const monthKey = format(monthStart, 'yyyy-MM');

  // Initialize monthly employees if not exists
  useEffect(() => {
    if (!monthlyEmployeeData[monthKey]) {
      setMonthlyEmployeeData({
        ...monthlyEmployeeData,
        [monthKey]: employeeData.map(emp => ({
          name: emp.name,
          monthlyLeaveAllowance: emp.monthlyLeaveAllowance
        }))
      });
    }
  }, [monthKey, employeeData, monthlyEmployeeData, setMonthlyEmployeeData]);

  // Get current month's employees
  const currentMonthEmployees = monthlyEmployeeData[monthKey] || employeeData;

  // Calculate employee counts for the current month
  const currentMonthEmployeeCounts = useMemo(() => {
    const counts = new Array(currentMonthEmployees.length).fill(0);
    
    Object.entries(vacations).forEach(([dateKey, items]) => {
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        items.forEach(item => {
          const index = currentMonthEmployees.findIndex(emp => emp.name === item.text);
          if (index !== -1) {
            counts[index]++;
          }
        });
      }
    });
    
    return counts;
  }, [vacations, currentMonthEmployees, monthStart, monthEnd]);
  
  // Get all days in the month
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate the number of days to add at the start to align with the first day of the week
  const startDay = getDay(monthStart);
  const daysToAdd = (startDay + 6) % 7; // Adjust to make Monday the first day of the week
  
  // Add empty days at the start to align with the first day of the week
  const calendarDays = [
    ...Array(daysToAdd).fill(null),
    ...monthDays
  ];

  // Add navigation functions
  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // Handle employee data change
  const handleEmployeeDataChange = (index: number, field: 'name' | 'monthlyLeaveAllowance', value: string | number) => {
    const newMonthlyEmployees = { ...monthlyEmployeeData };
    if (!newMonthlyEmployees[monthKey]) {
      newMonthlyEmployees[monthKey] = [...currentMonthEmployees];
    }
    
    newMonthlyEmployees[monthKey][index] = {
      ...newMonthlyEmployees[monthKey][index],
      [field]: value
    };
    
    setMonthlyEmployeeData(newMonthlyEmployees);

    // Update vacations for this employee in the current month
    const monthVacations = Object.entries(vacations).filter(([dateKey]) => {
      const date = new Date(dateKey);
      return date >= monthStart && date <= monthEnd;
    });

    const updatedVacations = { ...vacations };
    monthVacations.forEach(([dateKey, dayVacations]) => {
      updatedVacations[dateKey] = dayVacations.map(item => {
        if (item.text === currentMonthEmployees[index].name) {
          return { ...item, text: value as string };
        }
        return item;
      });
    });
    setVacations(updatedVacations);
  };

  // Handle text change with allowance check
  const handleTextChange = (date: string, itemId: string, newText: string) => {
    // Don't allow empty text
    if (!newText.trim()) return;

    const currentVacations = vacations[date] || [];
    const updatedVacations = currentVacations.map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );

    setVacations({
      ...vacations,
      [date]: updatedVacations
    });
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

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const [sourceDate, sourceId] = active.id.toString().split('-');
    const [destDate, destId] = over.id.toString().split('-');

    // Get the vacation item being dragged
    const sourceItems = vacations[sourceDate] || [];
    const draggedItem = sourceItems.find(item => item.id === sourceId);
    if (!draggedItem) return;

    // If the destination day already has 2 employees, don't allow the transfer
    const destItems = vacations[destDate] || [];
    if (destItems.length >= 2) return;

    // Remove the item from the source day
    const updatedSourceItems = sourceItems.filter(item => item.id !== sourceId);
    
    // Add the item to the destination day
    const updatedDestItems = [...destItems, draggedItem];

    // Update the vacations state
    const updatedVacations: VacationsType = {
      ...vacations,
      [sourceDate]: updatedSourceItems,
      [destDate]: updatedDestItems
    };
    setVacations(updatedVacations);
  };

  // Handle deleting a vacation item
  const handleDeleteVacation = (date: string, itemId: string) => {
    const currentVacations = vacations[date] || [];
    const updatedVacations = currentVacations.filter(item => item.id !== itemId);
    
    setVacations({
      ...vacations,
      [date]: updatedVacations
    });
  };

  // Sortable vacation item component
  const SortableVacationItem = ({ id, text, onTextChange, onDelete }: { 
    id: string; 
    text: string; 
    onTextChange: (id: string, text: string) => void;
    onDelete: (id: string) => void;
  }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    // Extract the actual item ID from the combined ID
    const [dateKey, itemId] = id.split('-');

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center gap-2 p-2 bg-background border rounded-md mb-2 cursor-move hover:bg-accent"
      >
        <Select
          value={text || undefined}
          onValueChange={(value) => onTextChange(itemId, value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {currentMonthEmployees
              .filter(emp => emp.name.trim() !== '')
              .map((employee, index) => {
                const isEmployeeDisabled = currentMonthEmployeeCounts[index] >= employee.monthlyLeaveAllowance;
                return (
                  <SelectItem 
                    key={index} 
                    value={employee.name}
                    disabled={isEmployeeDisabled}
                  >
                    {employee.name} ({currentMonthEmployeeCounts[index]}/{employee.monthlyLeaveAllowance})
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(itemId);
          }}
          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale })}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Monthly Leave Status */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Number of Employees */}
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                {isArabic ? "عدد الموظفين" : "Number of Employees"}
              </div>
              <div className="text-2xl font-bold">
                {currentMonthEmployees.filter(emp => emp.name.trim() !== '').length}
              </div>
            </div>
          </Card>

          {/* Available Leaves */}
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                {isArabic ? "الإجازات المتاحة" : "Available Leaves"}
              </div>
              <div className="text-2xl font-bold text-green-600">
                {currentMonthEmployees.reduce((total, emp) => total + emp.monthlyLeaveAllowance, 0)}
              </div>
            </div>
          </Card>

          {/* Used Leaves */}
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                {isArabic ? "الإجازات المستخدمة" : "Used Leaves"}
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.entries(vacations).reduce((total, [dateKey, dayVacations]) => {
                  const date = new Date(dateKey);
                  if (date >= monthStart && date <= monthEnd) {
                    return total + dayVacations.length;
                  }
                  return total;
                }, 0)}
              </div>
            </div>
          </Card>

          {/* Remaining Leaves */}
          <Card className="p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-muted-foreground">
                {isArabic ? "الإجازات المتبقية" : "Remaining Leaves"}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {currentMonthEmployees.reduce((total, emp) => total + emp.monthlyLeaveAllowance, 0) - 
                 Object.entries(vacations).reduce((total, [dateKey, dayVacations]) => {
                   const date = new Date(dateKey);
                   if (date >= monthStart && date <= monthEnd) {
                     return total + dayVacations.length;
                   }
                   return total;
                 }, 0)}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Employee List */}
        <div className="w-full lg:w-64 shrink-0">
          <h3 className="text-lg font-medium mb-3">
            {isArabic ? "الموظفون" : "Employees"}
          </h3>
          <div className="space-y-3">
            {currentMonthEmployees.map((employee, index) => (
              <div key={index} className="space-y-2">
                <Input
                  value={employee.name}
                  onChange={(e) => handleEmployeeDataChange(index, 'name', e.target.value)}
                  className="w-full"
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={employee.monthlyLeaveAllowance}
                    onChange={(e) => handleEmployeeDataChange(index, 'monthlyLeaveAllowance', parseInt(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {isArabic ? "الإجازات المسموحة" : "Leaves Allowance"}
                  </span>
                  <div className={cn(
                    "text-sm",
                    EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length]
                  )}>
                    {currentMonthEmployeeCounts[index]}/{employee.monthlyLeaveAllowance}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[800px] mx-auto">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="text-center font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-32" />;
                }

                const dateKey = format(day, 'yyyy-MM-dd');
                const dayVacations = vacations[dateKey] || [];

                return (
                  <div
                    key={dateKey}
                    className={cn(
                      "border rounded-md p-2 min-h-[8rem]",
                      day < new Date() && "opacity-50"
                    )}
                  >
                    <div className="text-sm mb-2">{format(day, 'd')}</div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={dayVacations.map(item => `${dateKey}-${item.id}`)}
                        strategy={verticalListSortingStrategy}
                      >
                        {dayVacations.map(item => (
                          <SortableVacationItem
                            key={item.id}
                            id={`${dateKey}-${item.id}`}
                            text={item.text}
                            onTextChange={(id, text) => handleTextChange(dateKey, id, text)}
                            onDelete={(id) => handleDeleteVacation(dateKey, id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    {dayVacations.length < 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleAddVacation(day)}
                      >
                        +
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MonthlyVacationsTool; 