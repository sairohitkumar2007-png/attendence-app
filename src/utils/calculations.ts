import { AttendanceRecord, Subject, SubjectStats, OverallStats } from '../types/attendance';

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getTodayDateString(): string {
  // Uses local date string format YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDatePretty(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateCompact(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDayOfWeekFromDate(dateStr: string): number {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getDay(); // 0 is Sunday, 1 is Monday...
}

/**
 * Calculate how many consecutive classes a student can safely miss
 * without falling below targetPercentage.
 */
export function calculateSafeBunks(present: number, total: number, targetPct: number): number {
  if (total === 0 || targetPct <= 0 || targetPct >= 100) return 0;
  const currentPct = (present / total) * 100;
  if (currentPct < targetPct) return 0;

  // Formula: Math.floor((present * 100 / targetPct) - total)
  const bunks = Math.floor((present * 100) / targetPct - total);
  return Math.max(0, bunks);
}

/**
 * Calculate how many consecutive classes a student must attend
 * without missing any to reach targetPercentage.
 */
export function calculateClassesNeeded(present: number, total: number, targetPct: number): number {
  if (targetPct <= 0 || targetPct >= 100) return 0;
  if (total === 0) return 0;
  const currentPct = (present / total) * 100;
  if (currentPct >= targetPct) return 0;

  const targetDecimal = targetPct / 100;
  // Formula: ceil((target * total - present) / (1 - target))
  const needed = Math.ceil((targetDecimal * total - present) / (1 - targetDecimal));
  return Math.max(0, needed);
}

export function calculateSubjectStats(
  subject: Subject,
  records: AttendanceRecord[],
  defaultTargetPct = 75
): SubjectStats {
  const targetPct = subject.targetPercentage ?? defaultTargetPct;
  const subjectRecords = records.filter((r) => r.subjectId === subject.id);

  let present = 0;
  let absent = 0;
  let noClass = 0;

  for (const r of subjectRecords) {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'no_class') noClass++;
  }

  const totalConducted = present + absent;
  const percentage = totalConducted === 0 ? 100 : Number(((present / totalConducted) * 100).toFixed(1));

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  if (percentage < targetPct - 10) {
    status = 'critical';
  } else if (percentage < targetPct) {
    status = 'warning';
  }

  const classesCanBunk = calculateSafeBunks(present, totalConducted, targetPct);
  const classesNeeded = calculateClassesNeeded(present, totalConducted, targetPct);

  return {
    subject,
    present,
    absent,
    noClass,
    totalConducted,
    percentage,
    status,
    classesCanBunk,
    classesNeeded,
  };
}

export function calculateOverallStats(
  subjects: Subject[],
  records: AttendanceRecord[],
  targetPct = 75
): OverallStats {
  let present = 0;
  let absent = 0;
  let noClass = 0;

  for (const r of records) {
    if (r.status === 'present') present++;
    else if (r.status === 'absent') absent++;
    else if (r.status === 'no_class') noClass++;
  }

  const totalConducted = present + absent;
  const percentage = totalConducted === 0 ? 100 : Number(((present / totalConducted) * 100).toFixed(1));

  let status: 'safe' | 'warning' | 'critical' = 'safe';
  if (percentage < targetPct - 10) {
    status = 'critical';
  } else if (percentage < targetPct) {
    status = 'warning';
  }

  const classesCanBunk = calculateSafeBunks(present, totalConducted, targetPct);
  const classesNeeded = calculateClassesNeeded(present, totalConducted, targetPct);

  let subjectsAboveTarget = 0;
  let subjectsBelowTarget = 0;

  for (const sub of subjects) {
    const subStats = calculateSubjectStats(sub, records, targetPct);
    if (subStats.percentage >= (sub.targetPercentage || targetPct)) {
      subjectsAboveTarget++;
    } else {
      subjectsBelowTarget++;
    }
  }

  return {
    present,
    absent,
    noClass,
    totalConducted,
    percentage,
    targetPercentage: targetPct,
    status,
    classesCanBunk,
    classesNeeded,
    totalSubjects: subjects.length,
    subjectsAboveTarget,
    subjectsBelowTarget,
  };
}

export interface DayAttendanceSummary {
  date: string;
  totalScheduled: number;
  present: number;
  absent: number;
  noClass: number;
  isHoliday: boolean;
  holidayName?: string;
  isPartial: boolean;
  isFullPresent: boolean;
  isFullAbsent: boolean;
  hasActivity: boolean;
}

export function getAttendanceStatusColor(percentage: number, target: number = 75) {
  if (percentage >= target) {
    return {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      progress: 'bg-emerald-600',
      badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      label: 'Safe',
    };
  }
  if (percentage >= target - 10) {
    return {
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      progress: 'bg-amber-500',
      badge: 'text-amber-700 bg-amber-50 border-amber-200',
      label: 'Warning',
    };
  }
  return {
    text: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    progress: 'bg-rose-600',
    badge: 'text-rose-700 bg-rose-50 border-rose-200',
    label: 'Critical Shortage',
  };
}

export function getSubjectColorClasses(colorName: string) {
  const map: Record<string, { bg: string; text: string; border: string; dot: string; lightBg: string }> = {
    indigo: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      dot: 'bg-indigo-500',
      lightBg: 'bg-indigo-50',
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
      lightBg: 'bg-emerald-50',
    },
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-700',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
      lightBg: 'bg-blue-50',
    },
    amber: {
      bg: 'bg-amber-600',
      text: 'text-amber-700',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      lightBg: 'bg-amber-50',
    },
    rose: {
      bg: 'bg-rose-600',
      text: 'text-rose-700',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
      lightBg: 'bg-rose-50',
    },
    violet: {
      bg: 'bg-violet-600',
      text: 'text-violet-700',
      border: 'border-violet-200',
      dot: 'bg-violet-500',
      lightBg: 'bg-violet-50',
    },
    cyan: {
      bg: 'bg-cyan-600',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      dot: 'bg-cyan-500',
      lightBg: 'bg-cyan-50',
    },
    slate: {
      bg: 'bg-slate-600',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-500',
      lightBg: 'bg-slate-50',
    },
  };

  return map[colorName] || map.indigo;
}
