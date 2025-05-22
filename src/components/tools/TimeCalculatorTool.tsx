import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format, differenceInSeconds, add, differenceInMonths, differenceInYears, differenceInDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";

const TimeCalculatorTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [calculatorMode, setCalculatorMode] = useState<"time" | "date">("time");
  
  // Time mode
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [timeDifference, setTimeDifference] = useState<string>("");
  
  // Date mode
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(add(new Date(), { days: 7 }));
  const [dateResult, setDateResult] = useState<{
    years: number;
    months: number;
    days: number;
  } | null>(null);

  const months = [
    { value: 0, label: isArabic ? "يناير" : "January" },
    { value: 1, label: isArabic ? "فبراير" : "February" },
    { value: 2, label: isArabic ? "مارس" : "March" },
    { value: 3, label: isArabic ? "أبريل" : "April" },
    { value: 4, label: isArabic ? "مايو" : "May" },
    { value: 5, label: isArabic ? "يونيو" : "June" },
    { value: 6, label: isArabic ? "يوليو" : "July" },
    { value: 7, label: isArabic ? "أغسطس" : "August" },
    { value: 8, label: isArabic ? "سبتمبر" : "September" },
    { value: 9, label: isArabic ? "أكتوبر" : "October" },
    { value: 10, label: isArabic ? "نوفمبر" : "November" },
    { value: 11, label: isArabic ? "ديسمبر" : "December" },
  ];

  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);
  
  const calculateTimeDifference = () => {
    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        throw new Error("Invalid time format");
      }
      
      let diffMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
      
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // Add a day if end time is on the next day
      }
      
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      
      setTimeDifference(`${hours} ${isArabic ? "ساعة" : "hour(s)"} ${minutes} ${isArabic ? "دقيقة" : "minute(s)"}`);
      
    } catch (error) {
      setTimeDifference(isArabic ? "خطأ في حساب الفرق الزمني" : "Error calculating time difference");
    }
  };
  
  const calculateDateDifference = () => {
    try {
      if (!startDate || !endDate) return;
      
      // Calculate exact differences
      const years = differenceInYears(endDate, startDate);
      const months = differenceInMonths(endDate, startDate) % 12;
      const days = differenceInDays(endDate, startDate) % 30;
      
      setDateResult({ years, months, days });
      
    } catch (error) {
      setDateResult(null);
    }
  };

  const handleDateChange = (date: Date | undefined, isStart: boolean) => {
    if (!date) return;
    
    if (isStart) {
      setStartDate(date);
      // If end date is before start date, update it
      if (endDate < date) {
        setEndDate(date);
      }
    } else {
      setEndDate(date);
    }
  };

  const handleMonthChange = (monthStr: string, isStart: boolean) => {
    const newMonth = parseInt(monthStr, 10);
    if (isStart) {
      const newDate = new Date(startDate);
      newDate.setMonth(newMonth);
      setStartDate(newDate);
    } else {
      const newDate = new Date(endDate);
      newDate.setMonth(newMonth);
      setEndDate(newDate);
    }
  };

  const handleYearChange = (yearStr: string, isStart: boolean) => {
    const newYear = parseInt(yearStr, 10);
    if (isStart) {
      const newDate = new Date(startDate);
      newDate.setFullYear(newYear);
      setStartDate(newDate);
    } else {
      const newDate = new Date(endDate);
      newDate.setFullYear(newYear);
      setEndDate(newDate);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={calculatorMode} onValueChange={(v) => setCalculatorMode(v as any)}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="time">{isArabic ? "وقت" : "Time"}</TabsTrigger>
          <TabsTrigger value="date">{isArabic ? "تاريخ" : "Date"}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">{isArabic ? "وقت البدء" : "Start Time"}</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">{isArabic ? "وقت الانتهاء" : "End Time"}</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={calculateTimeDifference}>
                    {isArabic ? "حساب الفرق" : "Calculate Difference"}
                  </Button>
                </div>
                
                {timeDifference && (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="font-medium">{isArabic ? "فرق الوقت" : "Time Difference"}</p>
                    <p className="text-lg">{timeDifference}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="date" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "تاريخ البدء" : "Start Date"}</Label>
                    <div className="flex gap-2 mb-2">
                      <Select
                        value={startDate.getMonth().toString()}
                        onValueChange={(value) => handleMonthChange(value, true)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder={isArabic ? "الشهر" : "Month"} />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value.toString()}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={startDate.getFullYear().toString()}
                        onValueChange={(value) => handleYearChange(value, true)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder={isArabic ? "السنة" : "Year"} />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border rounded-md">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateChange(date, true)}
                        fromDate={new Date(1900, 0, 1)}
                        toDate={new Date(2100, 11, 31)}
                        defaultMonth={startDate}
                      />
                    </div>
                    <p className="text-center text-sm">
                      {format(startDate, "PPP")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{isArabic ? "تاريخ الانتهاء" : "End Date"}</Label>
                    <div className="flex gap-2 mb-2">
                      <Select
                        value={endDate.getMonth().toString()}
                        onValueChange={(value) => handleMonthChange(value, false)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder={isArabic ? "الشهر" : "Month"} />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((m) => (
                            <SelectItem key={m.value} value={m.value.toString()}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={endDate.getFullYear().toString()}
                        onValueChange={(value) => handleYearChange(value, false)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder={isArabic ? "السنة" : "Year"} />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="border rounded-md">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateChange(date, false)}
                        fromDate={startDate}
                        toDate={new Date(2100, 11, 31)}
                        defaultMonth={endDate}
                      />
                    </div>
                    <p className="text-center text-sm">
                      {format(endDate, "PPP")}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button onClick={calculateDateDifference}>
                    {isArabic ? "حساب الفرق" : "Calculate Difference"}
                  </Button>
                </div>
                
                {dateResult && (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="font-medium">{isArabic ? "فرق التاريخ" : "Date Difference"}</p>
                    <p className="text-lg">
                      {dateResult.years > 0 && `${dateResult.years} ${isArabic ? "سنة" : "year(s)"} `}
                      {dateResult.months > 0 && `${dateResult.months} ${isArabic ? "شهر" : "month(s)"} `}
                      {dateResult.days > 0 && `${dateResult.days} ${isArabic ? "يوم" : "day(s)"}`}
                      {dateResult.years === 0 && dateResult.months === 0 && dateResult.days === 0 && 
                        (isArabic ? "نفس اليوم" : "Same day")}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeCalculatorTool;
