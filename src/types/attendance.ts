export type AttendanceStatus = 'present' | 'absent' | 'no_class';

export interface Semester {
  id: string;
  name: string; // e.g. "Fall 2026", "Semester V"
  code?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  targetAttendancePct: number; // default 75
  isActive: boolean;
}

export interface Subject {
  id: string;
  semesterId: string;
  code: string; // e.g. "CS301"
  name: string; // e.g. "Data Structures & Algorithms"
  professor?: string;
  color: string; // hex or Tailwind color token like "indigo", "emerald", etc.
  targetPercentage: number; // default 75
  credits?: number;
}

export interface TimetableSlot {
  id: string;
  semesterId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  subjectId: string;
  startTime: string; // HH:mm e.g. "09:00"
  endTime: string; // HH:mm e.g. "10:00"
  room?: string; // e.g. "Hall 302"
}

export interface AttendanceRecord {
  id: string;
  semesterId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  slotId?: string; // linked timetable slot if scheduled
  timeSlot?: string; // e.g. "09:00 - 10:00"
  notes?: string; // e.g. "Sick leave", "Attended tutorial"
  isSpecialClass?: boolean;
  createdAt: number;
}

export type HolidayType = 'holiday' | 'exam' | 'institutional' | 'break';

export interface AcademicHoliday {
  id: string;
  semesterId: string;
  name: string; // e.g. "National Holiday", "Fall Mid-Term Break"
  date: string; // YYYY-MM-DD
  type: HolidayType;
  note?: string;
}

export interface SpecialClass {
  id: string;
  semesterId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room?: string;
  reason?: string; // e.g. "Extra lab session", "Exam revision"
}

export interface SubjectStats {
  subject: Subject;
  present: number;
  absent: number;
  noClass: number;
  totalConducted: number; // present + absent
  percentage: number;
  status: 'safe' | 'warning' | 'critical';
  classesCanBunk: number; // how many can miss while >= targetPercentage
  classesNeeded: number; // how many must attend to reach targetPercentage
}

export interface OverallStats {
  present: number;
  absent: number;
  noClass: number;
  totalConducted: number;
  percentage: number;
  targetPercentage: number;
  status: 'safe' | 'warning' | 'critical';
  classesCanBunk: number;
  classesNeeded: number;
  totalSubjects: number;
  subjectsAboveTarget: number;
  subjectsBelowTarget: number;
}
