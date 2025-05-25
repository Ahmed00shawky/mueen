import { useMemo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/context/SettingsContext";
import { useVacations } from "@/context/VacationsContext";
import { Language } from "@/lib/types";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays, addMonths, subMonths } from "date-fns";
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
    setEmployeeData, 
    monthlyEmployeeData,
    setMonthlyEmployeeData,
    employeeCounts, 
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
    // If the new text is empty, just update it
    if (!newText) {
      setVacations({
        ...vacations,
        [date]: vacations[date].map(item => 
          item.id === itemId ? { ...item, text: newText } : item
        )
      });
      return;
    }

    // Find the employee and check their allowance
    const employeeIndex = currentMonthEmployees.findIndex(emp => emp.name === newText);
    if (employeeIndex === -1) return;

    const currentCount = currentMonthEmployeeCounts[employeeIndex];
    const allowance = currentMonthEmployees[employeeIndex].monthlyLeaveAllowance;

    // If the employee hasn't reached their allowance, allow the change
    if (currentCount < allowance) {
      setVacations({
        ...vacations,
        [date]: vacations[date].map(item => 
          item.id === itemId ? { ...item, text: newText } : item
        )
      });
    }
  };

  // Handle adding a new vacation item
  const handleAddVacation = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const currentItems = vacations[dateKey] || [];
    
    // Check if there are any available employees (not reached their allowance)
    const availableEmployees = currentMonthEmployees.filter(emp => {
      const count = currentMonthEmployeeCounts[currentMonthEmployees.indexOf(emp)];
      return count < emp.monthlyLeaveAllowance;
    });

    if (currentItems.length < 2 && availableEmployees.length > 0) {
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

  // Handle deleting a vacation item
  const handleDeleteVacation = (date: string, itemId: string) => {
    setVacations({
      ...vacations,
      [date]: vacations[date].filter(item => item.id !== itemId)
    });
  };

  // Get day names for the header
  const dayNames = Array.from({ length: 7 }, (_, i) => {
    // Create a date for each day of the week starting from Monday
    const day = new Date(2024, 0, i + 1);
    return format(day, 'EEEE', { locale });
  });

  // Calculate employee counts for the current month
  const currentMonthEmployeeCounts = useMemo(() => {
    const counts = new Array(currentMonthEmployees.length).fill(0);
    
    // Filter vacations for the current month
    const monthVacations = Object.entries(vacations).filter(([dateKey]) => {
      const date = new Date(dateKey);
      return date >= monthStart && date <= monthEnd;
    });

    // Count vacations for each employee in the current month
    monthVacations.forEach(([_, dayVacations]) => {
      dayVacations.forEach(item => {
        if (item.text) {
          const employeeIndex = currentMonthEmployees.findIndex(emp => emp.name === item.text);
          if (employeeIndex !== -1) {
            counts[employeeIndex]++;
          }
        }
      });
    });

    return counts;
  }, [vacations, currentMonthEmployees, monthStart, monthEnd]);

  // Calculate status metrics for the current month
  const statusMetrics = useMemo(() => {
    const totalEmployees = currentMonthEmployees.filter(emp => emp.name).length;
    const totalAllowance = currentMonthEmployees.reduce((sum, emp) => sum + emp.monthlyLeaveAllowance, 0);
    
    // Only count leaves for the current month where an employee is actually selected
    const totalUsed = Object.entries(vacations).reduce((sum, [dateKey, dayVacations]) => {
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        return sum + dayVacations.filter(item => item.text).length;
      }
      return sum;
    }, 0);

    // Calculate remaining leaves (available - used)
    const daysLeft = totalAllowance - totalUsed;

    return {
      totalEmployees,
      totalAllowance,
      totalUsed,
      daysLeft
    };
  }, [currentMonthEmployees, vacations, monthStart, monthEnd]);

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Status Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isArabic ? "عدد الموظفين" : "Number of Employees"}
            </div>
            <div className="text-2xl font-semibold">{statusMetrics.totalEmployees}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isArabic ? "الإجازات المتاحة" : "Available Leaves"}
            </div>
            <div className="text-2xl font-semibold text-green-600">{statusMetrics.totalAllowance}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isArabic ? "الإجازات المستخدمة" : "Used Leaves"}
            </div>
            <div className="text-2xl font-semibold text-orange-600">{statusMetrics.totalUsed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isArabic ? "الإجازات المتبقية" : "Remaining Leaves"}
            </div>
            <div className="text-2xl font-semibold text-blue-600">{statusMetrics.daysLeft}</div>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Employee Names Section - Top on mobile, Left on desktop */}
          <div className="w-full md:w-64">
            <div className="md:sticky md:top-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4">
                {isArabic ? "أسماء الموظفين" : "Employee Names"}
              </h3>
              {currentMonthEmployees.map((employee, index) => (
                <div key={index} className="space-y-2 p-3 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      {isArabic ? `موظف ${index + 1}` : `Employee ${index + 1}`}
                    </label>
                    <span className={cn("text-sm font-medium", 
                      currentMonthEmployeeCounts[index] < employee.monthlyLeaveAllowance ? 'text-yellow-600' :
                      currentMonthEmployeeCounts[index] === employee.monthlyLeaveAllowance ? 'text-green-600' :
                      'text-red-600'
                    )}>
                      {currentMonthEmployeeCounts[index]}/{employee.monthlyLeaveAllowance} {isArabic ? "مرة" : "times"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Input
                      value={employee.name}
                      onChange={(e) => handleEmployeeDataChange(index, 'name', e.target.value)}
                      placeholder={isArabic ? "أدخل اسم الموظف..." : "Enter employee name..."}
                      className={cn("w-full", EMPLOYEE_COLORS[index])}
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground whitespace-nowrap">
                        {isArabic ? "الإجازات المسموحة:" : "Leave Allowance:"}
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="31"
                        value={employee.monthlyLeaveAllowance}
                        onChange={(e) => handleEmployeeDataChange(index, 'monthlyLeaveAllowance', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar - Below on mobile, Right on desktop */}
          <div className="flex-1">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-4">
                {/* Month and Year Header with Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-2xl font-semibold">
                    {format(monthStart, 'MMMM yyyy', { locale })}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
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
                        const hasEmployees = dayVacations.length > 0;

                        return (
                          <Card 
                            key={dateKey} 
                            className={cn(
                              "relative w-full pb-[100%]",
                              hasEmployees && "bg-green-50 dark:bg-green-950/20"
                            )}
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
                                            <div className="flex items-center gap-1">
                                              <Select
                                                value={item.text}
                                                onValueChange={(value) => handleTextChange(dateKey, item.id, value)}
                                              >
                                                <SelectTrigger className={cn("h-7 text-xs flex-1", EMPLOYEE_COLORS[currentMonthEmployees.findIndex(emp => emp.name === item.text)])}>
                                                  <SelectValue placeholder={isArabic ? "اختر موظف..." : "Select employee..."} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  {currentMonthEmployees.map((emp, idx) => {
                                                    const count = currentMonthEmployeeCounts[idx];
                                                    const isAvailable = count < emp.monthlyLeaveAllowance;
                                                    return (
                                                      emp.name && (
                                                        <SelectItem 
                                                          key={idx} 
                                                          value={emp.name} 
                                                          className={cn(
                                                            EMPLOYEE_COLORS[idx],
                                                            !isAvailable && "opacity-50 cursor-not-allowed"
                                                          )}
                                                          disabled={!isAvailable}
                                                        >
                                                          {emp.name} ({count}/{emp.monthlyLeaveAllowance})
                                                        </SelectItem>
                                                      )
                                                    );
                                                  })}
                                                </SelectContent>
                                              </Select>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 shrink-0"
                                                onClick={() => handleDeleteVacation(dateKey, item.id)}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
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
                                        disabled={currentMonthEmployees.every(emp => 
                                          currentMonthEmployeeCounts[currentMonthEmployees.indexOf(emp)] >= emp.monthlyLeaveAllowance
                                        )}
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

export default MonthlyVacationsTool; 