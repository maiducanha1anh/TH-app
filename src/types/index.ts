export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  teacher: string;
  room: string;
  description: string;
}

export interface ScheduleItem {
  id: string;
  subjectCode: string;
  subjectName: string;
  dayOfWeek: string;
  time: string;
  room: string;
  teacher: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectName: string;
  dueDate: string;
  completed: boolean;
  description: string;
}

export interface StudentInfo {
  studentId: string;
  name: string;
  className: string;
  major: string;
  email: string;
  phone: string;
}

export interface GradeItem {
  id: string;
  subjectName: string;
  credits: number;
  attendance: number;
  midterm: number;
  final: number;
  overall: number;
  letterGrade: string;
}
