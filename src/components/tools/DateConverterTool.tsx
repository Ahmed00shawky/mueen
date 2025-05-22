import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";
import { Language } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import moment from 'moment-hijri';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface HijriDate {
  day: number;
  month: number;
  year: number;
  monthName: string;
}

const DateConverterTool = () => {
  const { language } = useSettings();
  const isArabic = language === Language.Arabic;
  const [gregorianDate, setGregorianDate] = useState<Date>(new Date());
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [showMonthName, setShowMonthName] = useState(true);
  const [conversionDirection, setConversionDirection] = useState<'gregorian-to-hijri' | 'hijri-to-gregorian'>('gregorian-to-hijri');
  const [selectedHijriMonth, setSelectedHijriMonth] = useState<number>(1);
  const [selectedHijriYear, setSelectedHijriYear] = useState<number>(1445);
  const [selectedHijriDay, setSelectedHijriDay] = useState<number>(1);

  const hijriMonthNames = [
    "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
    "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
    "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
  ];
  
  const hijriMonthNamesAr = [
    "محرم", "صفر", "ربيع الأول", "ربيع الثاني",
    "جمادى الأولى", "جمادى الثانية", "رجب", "شعبان",
    "رمضان", "شوال", "ذو القعدة", "ذو الحجة"
  ];

  // Convert Gregorian to Hijri date
  const convertGregorianToHijri = (date: Date): HijriDate => {
    try {
      const hijri = moment(date).format('iD/iM/iYYYY').split('/');
      const monthIndex = parseInt(hijri[1]) - 1;
      return {
        day: parseInt(hijri[0]),
        month: parseInt(hijri[1]),
        year: parseInt(hijri[2]),
        monthName: isArabic ? hijriMonthNamesAr[monthIndex] : hijriMonthNames[monthIndex]
      };
    } catch (error) {
      console.error('Error converting to Hijri:', error);
      return {
        day: 1,
        month: 1,
        year: 1445,
        monthName: isArabic ? hijriMonthNamesAr[0] : hijriMonthNames[0]
      };
    }
  };

  // Convert Hijri to Gregorian date
  const convertHijriToGregorian = (hijriDate: HijriDate): Date => {
    try {
      return moment(`${hijriDate.year}-${hijriDate.month}-${hijriDate.day}`, 'iYYYY-iM-iD').toDate();
    } catch (error) {
      console.error('Error converting from Hijri:', error);
      return new Date();
    }
  };

  useEffect(() => {
    if (conversionDirection === 'gregorian-to-hijri') {
      setHijriDate(convertGregorianToHijri(gregorianDate));
    }
  }, [gregorianDate, conversionDirection, isArabic]);

  const handleHijriDateChange = () => {
    if (conversionDirection === 'hijri-to-gregorian') {
      const newHijriDate: HijriDate = {
        day: selectedHijriDay,
        month: selectedHijriMonth,
        year: selectedHijriYear,
        monthName: isArabic ? hijriMonthNamesAr[selectedHijriMonth - 1] : hijriMonthNames[selectedHijriMonth - 1]
      };
      const newGregorianDate = convertHijriToGregorian(newHijriDate);
      setGregorianDate(newGregorianDate);
    }
  };

  useEffect(() => {
    handleHijriDateChange();
  }, [selectedHijriDay, selectedHijriMonth, selectedHijriYear]);

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button
          variant={conversionDirection === 'gregorian-to-hijri' ? 'default' : 'outline'}
          onClick={() => setConversionDirection('gregorian-to-hijri')}
        >
          {isArabic ? "ميلادي إلى هجري" : "Gregorian to Hijri"}
        </Button>
        <Button
          variant={conversionDirection === 'hijri-to-gregorian' ? 'default' : 'outline'}
          onClick={() => setConversionDirection('hijri-to-gregorian')}
        >
          {isArabic ? "هجري إلى ميلادي" : "Hijri to Gregorian"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {conversionDirection === 'gregorian-to-hijri' ? (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>{isArabic ? "التاريخ الميلادي" : "Gregorian Date"}</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={gregorianDate}
                        onSelect={(date) => date && setGregorianDate(date)}
                        className="rounded-md border mx-auto"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xl">
                        {format(gregorianDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>{isArabic ? "التاريخ الهجري" : "Hijri Date"}</Label>
                    <div className="mt-2 flex flex-col items-center justify-center h-[300px]">
                      {hijriDate && (
                        <div className="text-center">
                          <div className="text-3xl mb-4">
                            {hijriDate.day}{" "}
                            {showMonthName 
                              ? hijriDate.monthName 
                              : isArabic ? `${hijriDate.month} شهر` : `Month ${hijriDate.month}`}{" "}
                            {hijriDate.year}
                          </div>
                          <p className="text-muted-foreground">
                            {isArabic ? "التاريخ الهجري" : "Hijri Date"}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowMonthName(!showMonthName)}
                      >
                        {isArabic 
                          ? (showMonthName ? "عرض رقم الشهر" : "عرض اسم الشهر")
                          : (showMonthName ? "Show Month Number" : "Show Month Name")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>{isArabic ? "التاريخ الهجري" : "Hijri Date"}</Label>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>{isArabic ? "اليوم" : "Day"}</Label>
                          <Input
                            type="number"
                            min={1}
                            max={30}
                            value={selectedHijriDay}
                            onChange={(e) => setSelectedHijriDay(parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label>{isArabic ? "الشهر" : "Month"}</Label>
                          <Select
                            value={selectedHijriMonth.toString()}
                            onValueChange={(value) => setSelectedHijriMonth(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isArabic ? "اختر الشهر" : "Select Month"} />
                            </SelectTrigger>
                            <SelectContent>
                              {hijriMonthNames.map((month, index) => (
                                <SelectItem key={index + 1} value={(index + 1).toString()}>
                                  {isArabic ? hijriMonthNamesAr[index] : month}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{isArabic ? "السنة" : "Year"}</Label>
                          <Input
                            type="number"
                            min={1}
                            max={1500}
                            value={selectedHijriYear}
                            onChange={(e) => setSelectedHijriYear(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label>{isArabic ? "التاريخ الميلادي" : "Gregorian Date"}</Label>
                    <div className="mt-2">
                      <Calendar
                        mode="single"
                        selected={gregorianDate}
                        onSelect={(date) => date && setGregorianDate(date)}
                        className="rounded-md border mx-auto"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xl">
                        {format(gregorianDate, "MMMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {isArabic
              ? "ملاحظة: هذا التحويل دقيق باستخدام مكتبة moment-hijri."
              : "Note: This conversion is accurate using the moment-hijri library."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DateConverterTool;
