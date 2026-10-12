import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StudentInfo, Subject, ScheduleItem, Assignment, GradeItem } from '../types';
import {
  initialStudent,
  initialSubjects,
  initialSchedules,
  initialAssignments,
  initialGrades,
} from '../data/mockData';

interface AppContextType {
  student: StudentInfo;
  updateStudent: (updated: Partial<StudentInfo>) => void;
  subjects: Subject[];
  schedules: ScheduleItem[];
  assignments: Assignment[];
  toggleAssignment: (id: string) => void;
  grades: GradeItem[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [student, setStudent] = useState<StudentInfo>(initialStudent);
  const [subjects] = useState<Subject[]>(initialSubjects);
  const [schedules] = useState<ScheduleItem[]>(initialSchedules);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [grades] = useState<GradeItem[]>(initialGrades);

  const updateStudent = (updated: Partial<StudentInfo>) => {
    setStudent(prev => ({ ...prev, ...updated }));
  };

  const toggleAssignment = (id: string) => {
    setAssignments(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        student,
        updateStudent,
        subjects,
        schedules,
        assignments,
        toggleAssignment,
        grades,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
