import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '@/lib/storage';
import { format } from 'date-fns';

interface Employee {
  name: string;
  monthlyLeaveAllowance: number;
}

interface MonthlyEmployeeData {
  [monthKey: string]: Employee[];
}

interface VacationsContextType {
  employeeData: Employee[];
  setEmployeeData: (data: Employee[]) => void;
  monthlyEmployeeData: MonthlyEmployeeData;
  setMonthlyEmployeeData: (data: MonthlyEmployeeData) => void;
  employeeCounts: number[];
  vacations: Record<string, { id: string; text: string }[]>;
  setVacations: (vacations: Record<string, { id: string; text: string }[]>) => void;
}

const VacationsContext = createContext<VacationsContextType | undefined>(undefined);

export const VacationsProvider = ({ children }: { children: ReactNode }) => {
  const [employeeData, setEmployeeData] = useState<Employee[]>(() => {
    const savedData = storage.getEmployees();
    return savedData.length > 0 ? savedData : [
      { name: '', monthlyLeaveAllowance: 0 },
      { name: '', monthlyLeaveAllowance: 0 },
      { name: '', monthlyLeaveAllowance: 0 },
      { name: '', monthlyLeaveAllowance: 0 }
    ];
  });

  const [monthlyEmployeeData, setMonthlyEmployeeData] = useState<MonthlyEmployeeData>(() => {
    const savedData = storage.getMonthlyEmployees();
    return savedData || {};
  });

  const [vacations, setVacations] = useState<Record<string, { id: string; text: string }[]>>(() => {
    return storage.getVacations();
  });

  const [employeeCounts, setEmployeeCounts] = useState<number[]>([]);

  // Save employee data to storage whenever it changes
  useEffect(() => {
    storage.setEmployees(employeeData);
  }, [employeeData]);

  // Save monthly employee data to storage whenever it changes
  useEffect(() => {
    storage.setMonthlyEmployees(monthlyEmployeeData);
  }, [monthlyEmployeeData]);

  // Save vacations to storage whenever they change
  useEffect(() => {
    storage.setVacations(vacations);
  }, [vacations]);

  // Calculate employee counts whenever vacations change
  useEffect(() => {
    const counts = new Array(employeeData.length).fill(0);
    Object.values(vacations).forEach(dayVacations => {
      dayVacations.forEach(item => {
        if (item.text) {
          const employeeIndex = employeeData.findIndex(emp => emp.name === item.text);
          if (employeeIndex !== -1) {
            counts[employeeIndex]++;
          }
        }
      });
    });
    setEmployeeCounts(counts);
  }, [vacations, employeeData]);

  return (
    <VacationsContext.Provider value={{
      employeeData,
      setEmployeeData,
      monthlyEmployeeData,
      setMonthlyEmployeeData,
      employeeCounts,
      vacations,
      setVacations
    }}>
      {children}
    </VacationsContext.Provider>
  );
};

export const useVacations = () => {
  const context = useContext(VacationsContext);
  if (context === undefined) {
    throw new Error('useVacations must be used within a VacationsProvider');
  }
  return context;
}; 