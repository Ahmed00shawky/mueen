import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";

const CalendarTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth());
  
  const years = Array.from({ length: 21 }, (_, i) => year - 10 + i);
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
  
  const handleYearChange = (yearStr: string) => {
    const newYear = parseInt(yearStr, 10);
    setYear(newYear);
    
    if (date) {
      const newDate = new Date(date);
      newDate.setFullYear(newYear);
      setDate(newDate);
    }
  };

  const handleMonthChange = (monthStr: string) => {
    const newMonth = parseInt(monthStr, 10);
    setMonth(newMonth);
    
    if (date) {
      const newDate = new Date(date);
      newDate.setMonth(newMonth);
      setDate(newDate);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">
              {isArabic ? "التقويم" : "Calendar"}
            </h3>
            <div className="flex gap-2">
              <Select
                value={month.toString()}
                onValueChange={handleMonthChange}
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
                value={year.toString()}
                onValueChange={handleYearChange}
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
          </div>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              showOutsideDays
              month={new Date(year, month)}
              onMonthChange={(newMonth) => {
                setMonth(newMonth.getMonth());
                setYear(newMonth.getFullYear());
              }}
            />
          </div>
          
          {date && (
            <div className="mt-4 text-center">
              <p className="font-medium">
                {isArabic ? "التاريخ المحدد" : "Selected Date"}:
              </p>
              <p className="text-lg">
                {format(date, "MMMM d, yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(date, "EEEE")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarTool;
