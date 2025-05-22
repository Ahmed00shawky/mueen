import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from 'react';

interface VacationItem {
  id: string;
  text: string;
}

interface DayVacations {
  [key: string]: VacationItem[];
}

interface VacationsContextType {
  employeeNames: string[];
  setEmployeeNames: (names: string[]) => void;
  employeeCounts: number[];
  vacations: DayVacations;
  setVacations: (vacations: DayVacations) => void;
  saveVacations: () => void;
}

const STORAGE_KEY = 'monthly-leave-data';

const VacationsContext = createContext<VacationsContextType | undefined>(undefined);

export const VacationsProvider = ({ children }: { children: ReactNode }) => {
  // Load initial data from localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const { employeeNames, vacations } = JSON.parse(savedData);
        return { employeeNames, vacations };
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      employeeNames: ['', '', '', ''],
      vacations: {}
    };
  };

  const { employeeNames: savedNames, vacations: savedVacations } = loadSavedData();
  
  const [employeeNames, setEmployeeNames] = useState<string[]>(savedNames);
  const [vacations, setVacations] = useState<DayVacations>(savedVacations);

  // Calculate employee counts whenever vacations change
  const employeeCounts = useMemo(() => {
    const counts = new Array(4).fill(0);
    Object.values(vacations).forEach(dayVacations => {
      dayVacations.forEach(item => {
        const index = employeeNames.indexOf(item.text);
        if (index !== -1) {
          counts[index]++;
        }
      });
    });
    return counts;
  }, [vacations, employeeNames]);

  // Save data to localStorage whenever it changes
  const saveVacations = () => {
    try {
      const dataToSave = {
        employeeNames,
        vacations
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    saveVacations();
  }, [employeeNames, vacations]);

  const value = useMemo(() => ({
    employeeNames,
    setEmployeeNames,
    employeeCounts,
    vacations,
    setVacations,
    saveVacations
  }), [employeeNames, employeeCounts, vacations]);

  return (
    <VacationsContext.Provider value={value}>
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