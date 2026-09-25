import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Semester,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  AcademicHoliday,
  SpecialClass,
  SubjectStats,
  OverallStats,
  AttendanceStatus,
} from '../types/attendance';
import {
  INITIAL_SEMESTERS,
  INITIAL_SUBJECTS,
  INITIAL_TIMETABLE,
  INITIAL_HOLIDAYS,
  INITIAL_SPECIAL_CLASSES,
  generateSampleRecords,
} from '../data/defaultData';
import {
  calculateSubjectStats,
  calculateOverallStats,
  getTodayDateString,
  getDayOfWeekFromDate,
} from '../utils/calculations';

interface AttendanceContextType {
  semesters: Semester[];
  activeSemesterId: string;
  subjects: Subject[];
  timetable: TimetableSlot[];
  records: AttendanceRecord[];
  holidays: AcademicHoliday[];
  specialClasses: SpecialClass[];
  selectedDate: string;
  activeTab: 'dashboard' | 'calendar' | 'timetable' | 'history' | 'analytics';
  
  // Computed
  activeSemester: Semester | undefined;
  activeSubjects: Subject[];
  activeRecords: AttendanceRecord[];
  activeTimetable: TimetableSlot[];
  activeHolidays: AcademicHoliday[];
  activeSpecialClasses: SpecialClass[];
  subjectStatsList: SubjectStats[];
  overallStats: OverallStats;
  
  // Actions
  setActiveSemesterId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'timetable' | 'history' | 'analytics') => void;
  
  markAttendance: (
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    slotId?: string,
    timeSlot?: string,
    notes?: string,
    isSpecialClass?: boolean
  ) => void;
  quickToggleStatus: (
    subjectId: string,
    date: string,
    currentStatus?: AttendanceStatus,
    slotId?: string,
    timeSlot?: string
  ) => void;
  updateRecord: (recordId: string, updates: Partial<AttendanceRecord>) => void;
  deleteRecord: (recordId: string) => void;
  bulkMarkDay: (date: string, status: AttendanceStatus) => void;
  clearDayAttendance: (date: string) => void;
  
  addSubject: (subject: Omit<Subject, 'id' | 'semesterId'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'semesterId'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  
  addHoliday: (holiday: Omit<AcademicHoliday, 'id' | 'semesterId'>) => void;
  deleteHoliday: (id: string) => void;
  
  addSpecialClass: (specialClass: Omit<SpecialClass, 'id' | 'semesterId'>) => void;
  deleteSpecialClass: (id: string) => void;
  
  addSemester: (semester: Omit<Semester, 'id'>) => void;
  updateSemester: (id: string, updates: Partial<Semester>) => void;
  deleteSemester: (id: string) => void;
  
  resetToDefaultData: () => void;
  exportDataJson: () => string;
  importDataJson: (jsonString: string) => boolean;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SEMESTERS: 'rollcall_semesters_v1',
  ACTIVE_SEMESTER: 'rollcall_active_sem_v1',
  SUBJECTS: 'rollcall_subjects_v1',
  TIMETABLE: 'rollcall_timetable_v1',
  RECORDS: 'rollcall_records_v1',
  HOLIDAYS: 'rollcall_holidays_v1',
  SPECIAL_CLASSES: 'rollcall_special_v1',
};

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaultData
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
      return saved ? JSON.parse(saved) : INITIAL_SEMESTERS;
    } catch {
      return INITIAL_SEMESTERS;
    }
  });

  const [activeSemesterId, setActiveSemesterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SEMESTER);
      return saved || 'sem-fall-2026';
    } catch {
      return 'sem-fall-2026';
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TIMETABLE);
      return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
    } catch {
      return INITIAL_TIMETABLE;
    }
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      return saved ? JSON.parse(saved) : generateSampleRecords();
    } catch {
      return generateSampleRecords();
    }
  });

  const [holidays, setHolidays] = useState<AcademicHoliday[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
      return saved ? JSON.parse(saved) : INITIAL_HOLIDAYS;
    } catch {
      return INITIAL_HOLIDAYS;
    }
  });

  const [specialClasses, setSpecialClasses] = useState<SpecialClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SPECIAL_CLASSES);
      return saved ? JSON.parse(saved) : INITIAL_SPECIAL_CLASSES;
    } catch {
      return INITIAL_SPECIAL_CLASSES;
    }
  });

  // Current selected date for logging/viewing (default to 2026-09-25 or current date)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = getTodayDateString();
    // If today is within 2026, use it, else default to '2026-09-25'
    return today.startsWith('2026') ? today : '2026-09-25';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'timetable' | 'history' | 'analytics'>('dashboard');

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SEMESTERS, JSON.stringify(semesters));
  }, [semesters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SEMESTER, activeSemesterId);
  }, [activeSemesterId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMETABLE, JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  }, [holidays]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPECIAL_CLASSES, JSON.stringify(specialClasses));
  }, [specialClasses]);

  // Computed data for active semester
  const activeSemester = useMemo(
    () => semesters.find((s) => s.id === activeSemesterId) || semesters[0],
    [semesters, activeSemesterId]
  );

  const activeSubjects = useMemo(
    () => subjects.filter((s) => s.semesterId === activeSemesterId),
    [subjects, activeSemesterId]
  );

  const activeRecords = useMemo(
    () => records.filter((r) => r.semesterId === activeSemesterId),
    [records, activeSemesterId]
  );

  const activeTimetable = useMemo(
    () => timetable.filter((t) => t.semesterId === activeSemesterId),
    [timetable, activeSemesterId]
  );

  const activeHolidays = useMemo(
    () => holidays.filter((h) => h.semesterId === activeSemesterId),
    [holidays, activeSemesterId]
  );

  const activeSpecialClasses = useMemo(
    () => specialClasses.filter((sc) => sc.semesterId === activeSemesterId),
    [specialClasses, activeSemesterId]
  );

  const defaultTargetPct = activeSemester?.targetAttendancePct ?? 75;

  const subjectStatsList = useMemo(() => {
    return activeSubjects.map((sub) =>
      calculateSubjectStats(sub, activeRecords, defaultTargetPct)
    );
  }, [activeSubjects, activeRecords, defaultTargetPct]);

  const overallStats = useMemo(() => {
    return calculateOverallStats(activeSubjects, activeRecords, defaultTargetPct);
  }, [activeSubjects, activeRecords, defaultTargetPct]);

  // Actions
  const markAttendance = (
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    slotId?: string,
    timeSlot?: string,
    notes?: string,
    isSpecialClass?: boolean
  ) => {
    setRecords((prev) => {
      // Find if an existing record matches (by subjectId, date, and optional slotId)
      const existingIndex = prev.findIndex(
        (r) =>
          r.semesterId === activeSemesterId &&
          r.subjectId === subjectId &&
          r.date === date &&
          (slotId ? r.slotId === slotId : true)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status,
          slotId: slotId ?? updated[existingIndex].slotId,
          timeSlot: timeSlot ?? updated[existingIndex].timeSlot,
          notes: notes !== undefined ? notes : updated[existingIndex].notes,
          isSpecialClass: isSpecialClass ?? updated[existingIndex].isSpecialClass,
        };
        return updated;
      }

      // Create new record
      const newRecord: AttendanceRecord = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        semesterId: activeSemesterId,
        subjectId,
        date,
        status,
        slotId,
        timeSlot,
        notes,
        isSpecialClass,
        createdAt: Date.now(),
      };
      return [...prev, newRecord];
    });
  };

  const quickToggleStatus = (
    subjectId: string,
    date: string,
    currentStatus?: AttendanceStatus,
    slotId?: string,
    timeSlot?: string
  ) => {
    let nextStatus: AttendanceStatus = 'present';
    if (currentStatus === 'present') nextStatus = 'absent';
    else if (currentStatus === 'absent') nextStatus = 'no_class';
    else if (currentStatus === 'no_class') nextStatus = 'present';
    markAttendance(subjectId, date, nextStatus, slotId, timeSlot);
  };

  const updateRecord = (recordId: string, updates: Partial<AttendanceRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, ...updates } : r))
    );
  };

  const deleteRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
  };

  const bulkMarkDay = (date: string, status: AttendanceStatus) => {
    const dayOfWeek = getDayOfWeekFromDate(date);
    // Find all timetable slots for this day + special classes
    const daySlots = activeTimetable.filter((t) => t.dayOfWeek === dayOfWeek);
    const daySpecial = activeSpecialClasses.filter((sc) => sc.date === date);

    if (daySlots.length === 0 && daySpecial.length === 0) {
      // Mark all subjects
      activeSubjects.forEach((sub) => {
        markAttendance(sub.id, date, status);
      });
      return;
    }

    daySlots.forEach((slot) => {
      markAttendance(slot.subjectId, date, status, slot.id, `${slot.startTime} - ${slot.endTime}`);
    });

    daySpecial.forEach((sc) => {
      markAttendance(sc.subjectId, date, status, sc.id, `${sc.startTime} - ${sc.endTime}`, sc.reason, true);
    });
  };

  const clearDayAttendance = (date: string) => {
    setRecords((prev) =>
      prev.filter((r) => !(r.semesterId === activeSemesterId && r.date === date))
    );
  };

  // Subject management
  const addSubject = (subject: Omit<Subject, 'id' | 'semesterId'>) => {
    const newSubject: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
      semesterId: activeSemesterId,
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTimetable((prev) => prev.filter((t) => t.subjectId !== id));
    setRecords((prev) => prev.filter((r) => r.subjectId !== id));
  };

  // Timetable management
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'semesterId'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: `tt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      semesterId: activeSemesterId,
    };
    setTimetable((prev) => [...prev, newSlot]);
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetable((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  };

  // Holiday management
  const addHoliday = (holiday: Omit<AcademicHoliday, 'id' | 'semesterId'>) => {
    const newHoliday: AcademicHoliday = {
      ...holiday,
      id: `hol-${Date.now()}`,
      semesterId: activeSemesterId,
    };
    setHolidays((prev) => [...prev, newHoliday]);
  };

  const deleteHoliday = (id: string) => {
    setHolidays((prev) => prev.filter((h) => h.id !== id));
  };

  // Special Class management
  const addSpecialClass = (sc: Omit<SpecialClass, 'id' | 'semesterId'>) => {
    const newSc: SpecialClass = {
      ...sc,
      id: `sp-${Date.now()}`,
      semesterId: activeSemesterId,
    };
    setSpecialClasses((prev) => [...prev, newSc]);
  };

  const deleteSpecialClass = (id: string) => {
    setSpecialClasses((prev) => prev.filter((sc) => sc.id !== id));
  };

  // Semester management
  const addSemester = (semester: Omit<Semester, 'id'>) => {
    const newSem: Semester = {
      ...semester,
      id: `sem-${Date.now()}`,
    };
    setSemesters((prev) => [...prev, newSem]);
    setActiveSemesterId(newSem.id);
  };

  const updateSemester = (id: string, updates: Partial<Semester>) => {
    setSemesters((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSemester = (id: string) => {
    if (semesters.length <= 1) return;
    const remaining = semesters.filter((s) => s.id !== id);
    setSemesters(remaining);
    if (activeSemesterId === id) {
      setActiveSemesterId(remaining[0].id);
    }
  };

  const resetToDefaultData = () => {
    setSemesters(INITIAL_SEMESTERS);
    setActiveSemesterId('sem-fall-2026');
    setSubjects(INITIAL_SUBJECTS);
    setTimetable(INITIAL_TIMETABLE);
    setRecords(generateSampleRecords());
    setHolidays(INITIAL_HOLIDAYS);
    setSpecialClasses(INITIAL_SPECIAL_CLASSES);
    setSelectedDate('2026-09-25');
  };

  const exportDataJson = (): string => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      semesters,
      activeSemesterId,
      subjects,
      timetable,
      records,
      holidays,
      specialClasses,
    };
    return JSON.stringify(payload, null, 2);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.semesters && data.subjects && data.records) {
        setSemesters(data.semesters);
        if (data.activeSemesterId) setActiveSemesterId(data.activeSemesterId);
        setSubjects(data.subjects);
        setTimetable(data.timetable || []);
        setRecords(data.records || []);
        setHolidays(data.holidays || []);
        setSpecialClasses(data.specialClasses || []);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        semesters,
        activeSemesterId,
        subjects,
        timetable,
        records,
        holidays,
        specialClasses,
        selectedDate,
        activeTab,
        activeSemester,
        activeSubjects,
        activeRecords,
        activeTimetable,
        activeHolidays,
        activeSpecialClasses,
        subjectStatsList,
        overallStats,
        setActiveSemesterId,
        setSelectedDate,
        setActiveTab,
        markAttendance,
        quickToggleStatus,
        updateRecord,
        deleteRecord,
        bulkMarkDay,
        clearDayAttendance,
        addSubject,
        updateSubject,
        deleteSubject,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        addHoliday,
        deleteHoliday,
        addSpecialClass,
        deleteSpecialClass,
        addSemester,
        updateSemester,
        deleteSemester,
        resetToDefaultData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
