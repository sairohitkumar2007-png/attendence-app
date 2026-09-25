import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  formatDatePretty,
  getDayOfWeekFromDate,
  getAttendanceStatusColor,
  getSubjectColorClasses,
} from '../utils/calculations';
import { AttendanceStatus } from '../types/attendance';
import {
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  FileText,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenEditModal: (recordId?: string, defaultValues?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenEditModal }) => {
  const {
    activeSemester,
    activeSubjects,
    activeRecords,
    activeTimetable,
    activeHolidays,
    activeSpecialClasses,
    subjectStatsList,
    overallStats,
    selectedDate,
    setSelectedDate,
    markAttendance,
    bulkMarkDay,
    clearDayAttendance,
    setActiveTab,
  } = useAttendance();

  const [noteModalOpen, setNoteModalOpen] = useState<{
    subjectId: string;
    slotId?: string;
    timeSlot?: string;
    existingNote?: string;
  } | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Date shifting
  const shiftDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    setSelectedDate(`${ny}-${nm}-${nd}`);
  };

  const jumpToToday = () => {
    setSelectedDate('2026-09-25');
  };

  // Day data for selectedDate
  const dayOfWeek = getDayOfWeekFromDate(selectedDate);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Holiday check for selectedDate
  const dayHoliday = activeHolidays.find((h) => h.date === selectedDate);

  // Scheduled slots for this day of week
  const daySlots = activeTimetable
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Special classes for selectedDate
  const daySpecialClasses = activeSpecialClasses.filter(
    (sc) => sc.date === selectedDate
  );

  // Attendance records for selectedDate
  const dayRecords = activeRecords.filter((r) => r.date === selectedDate);

  // Subjects that have records today even if not on normal timetable (ad-hoc)
  const scheduledSubjectIds = new Set([
    ...daySlots.map((s) => s.subjectId),
    ...daySpecialClasses.map((s) => s.subjectId),
  ]);
  const adhocRecords = dayRecords.filter(
    (r) => !scheduledSubjectIds.has(r.subjectId)
  );

  // Requirement status color
  const overallColor = getAttendanceStatusColor(
    overallStats.percentage,
    overallStats.targetPercentage
  );

  // Critical subjects list (below target)
  const criticalSubjects = subjectStatsList.filter(
    (s) => s.percentage < (s.subject.targetPercentage || 75)
  );

  const handleOpenNoteModal = (
    subjectId: string,
    slotId?: string,
    timeSlot?: string,
    existingNote?: string
  ) => {
    setNoteModalOpen({ subjectId, slotId, timeSlot, existingNote });
    setTempNoteText(existingNote || '');
  };

  const handleSaveNote = () => {
    if (!noteModalOpen) return;
    const existingRec = dayRecords.find(
      (r) =>
        r.subjectId === noteModalOpen.subjectId &&
        (noteModalOpen.slotId ? r.slotId === noteModalOpen.slotId : true)
    );

    if (existingRec) {
      markAttendance(
        noteModalOpen.subjectId,
        selectedDate,
        existingRec.status,
        noteModalOpen.slotId,
        noteModalOpen.timeSlot,
        tempNoteText
      );
    } else {
      // Mark as present by default when adding note if unrecorded
      markAttendance(
        noteModalOpen.subjectId,
        selectedDate,
        'present',
        noteModalOpen.slotId,
        noteModalOpen.timeSlot,
        tempNoteText
      );
    }
    setNoteModalOpen(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Overall Attendance Hero Card */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Circular Percentage & Main Status */}
          <div className="lg:col-span-4 flex items-center gap-6">
            <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="9"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={
                    overallStats.percentage >= overallStats.targetPercentage
                      ? '#10b981'
                      : overallStats.percentage >= overallStats.targetPercentage - 10
                      ? '#f59e0b'
                      : '#f43f5e'
                  }
                  strokeWidth="9"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    40 *
                    (1 - Math.min(100, Math.max(0, overallStats.percentage)) / 100)
                  }
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {overallStats.percentage}%
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Overall
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Requirement: {overallStats.targetPercentage}%
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {overallStats.percentage >= overallStats.targetPercentage
                  ? 'Attendance On Track'
                  : 'Attendance Shortage'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {overallStats.percentage >= overallStats.targetPercentage ? (
                  <span className="text-emerald-700 font-medium">
                    You can safely miss up to {overallStats.classesCanBunk} class
                    {overallStats.classesCanBunk === 1 ? '' : 'es'} across all subjects.
                  </span>
                ) : (
                  <span className="text-rose-700 font-medium">
                    You must attend the next {overallStats.classesNeeded} class
                    {overallStats.classesNeeded === 1 ? '' : 'es'} to reach {overallStats.targetPercentage}%.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
            <div className="p-3 bg-slate-50/70 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Classes Attended</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-emerald-700 tabular-nums">
                  {overallStats.present}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">/ {overallStats.totalConducted}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Present sessions</span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Classes Missed</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-rose-700 tabular-nums">
                  {overallStats.absent}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">/ {overallStats.totalConducted}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Unexcused / absent</span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">Subjects Safe</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-slate-900 tabular-nums">
                  {overallStats.subjectsAboveTarget}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">/ {overallStats.totalSubjects}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Meeting 75% target</span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-lg">
              <span className="text-[11px] font-medium text-slate-500 block">At-Risk Subjects</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-xl font-bold tabular-nums ${
                    overallStats.subjectsBelowTarget > 0 ? 'text-amber-600' : 'text-slate-900'
                  }`}
                >
                  {overallStats.subjectsBelowTarget}
                </span>
                <span className="text-xs text-slate-400 tabular-nums">subjects</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Below 75% threshold</span>
            </div>
          </div>
        </div>

        {/* Warning Callout for short subjects */}
        {criticalSubjects.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/60 p-3.5 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="text-xs text-amber-900">
                <span className="font-semibold">Attention Required:</span>{' '}
                {criticalSubjects.map((cs) => (
                  <span key={cs.subject.id} className="mr-2">
                    {cs.subject.code} is at {cs.percentage}% (needs {cs.classesNeeded} consecutive class
                    {cs.classesNeeded === 1 ? '' : 'es'})
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setActiveTab('history')}
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. Today's Class Logging Section */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Daily Attendance Log</h2>
              {selectedDate === '2026-09-25' && (
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDatePretty(selectedDate)}
              {dayHoliday && <span className="ml-2 font-medium text-purple-700">· {dayHoliday.name}</span>}
            </p>
          </div>

          {/* Date Navigator Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => shiftDate(-1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={jumpToToday}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shiftDate(1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-md transition-colors cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => bulkMarkDay(selectedDate, 'present')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              Mark All Present
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenEditModal(undefined, {
                  date: selectedDate,
                  status: 'present',
                })
              }
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Add Special / Ad-hoc Class"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Classes List for Selected Date */}
        <div className="mt-5 space-y-3">
          {/* Holiday Banner if today is a holiday */}
          {dayHoliday && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-lg text-purple-900 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm flex items-center gap-1.5">
                  <span>Academic Holiday: {dayHoliday.name}</span>
                </div>
                {dayHoliday.note && (
                  <p className="text-xs text-purple-700 mt-0.5">{dayHoliday.note}</p>
                )}
              </div>
              <span className="text-xs font-medium uppercase tracking-wider text-purple-600">
                {dayHoliday.type}
              </span>
            </div>
          )}

          {/* If weekend and no scheduled classes */}
          {isWeekend && daySlots.length === 0 && daySpecialClasses.length === 0 && dayRecords.length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <h3 className="text-sm font-semibold text-slate-700">Weekend — No regular timetable</h3>
              <p className="text-xs text-slate-500 mt-1">
                You can add a special weekend class session or revision class if conducted.
              </p>
              <button
                type="button"
                onClick={() =>
                  onOpenEditModal(undefined, {
                    date: selectedDate,
                    status: 'present',
                    isSpecialClass: true,
                  })
                }
                className="mt-3 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Weekend Class</span>
              </button>
            </div>
          )}

          {/* Normal Timetable Slots */}
          {daySlots.map((slot) => {
            const subject = activeSubjects.find((s) => s.id === slot.subjectId);
            if (!subject) return null;
            const colorClass = getSubjectColorClasses(subject.color);

            // Find matching record
            const record = dayRecords.find(
              (r) => r.subjectId === slot.subjectId && r.slotId === slot.id
            ) || dayRecords.find((r) => r.subjectId === slot.subjectId);

            const status = record?.status;

            return (
              <div
                key={slot.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white"
              >
                {/* Class Info */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-2.5 h-10 rounded-full shrink-0 ${colorClass.bg}`} />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{subject.code}</span>
                      <span className="text-xs text-slate-600 font-medium">{subject.name}</span>
                      {record?.notes && (
                        <span className="text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 max-w-xs truncate">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{record.notes}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </span>
                      {slot.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.room}</span>
                        </span>
                      )}
                      {subject.professor && (
                        <span className="hidden sm:inline">· {subject.professor}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Marking Action Buttons */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        slot.subjectId,
                        selectedDate,
                        'present',
                        slot.id,
                        `${slot.startTime} - ${slot.endTime}`
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        slot.subjectId,
                        selectedDate,
                        'absent',
                        slot.id,
                        `${slot.startTime} - ${slot.endTime}`
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        slot.subjectId,
                        selectedDate,
                        'no_class',
                        slot.id,
                        `${slot.startTime} - ${slot.endTime}`
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'no_class'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>No Class</span>
                  </button>

                  {/* Add note / reason */}
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenNoteModal(
                        slot.subjectId,
                        slot.id,
                        `${slot.startTime} - ${slot.endTime}`,
                        record?.notes
                      )
                    }
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    title={record?.notes ? `Edit note: ${record.notes}` : 'Add note / medical reason'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Special Classes scheduled for today */}
          {daySpecialClasses.map((sc) => {
            const subject = activeSubjects.find((s) => s.id === sc.subjectId);
            if (!subject) return null;
            const colorClass = getSubjectColorClasses(subject.color);

            const record = dayRecords.find(
              (r) => r.subjectId === sc.subjectId && r.slotId === sc.id
            );
            const status = record?.status;

            return (
              <div
                key={sc.id}
                className="p-4 rounded-lg border-2 border-indigo-200 bg-indigo-50/20 hover:border-indigo-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-2.5 h-10 rounded-full shrink-0 ${colorClass.bg}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{subject.code}</span>
                      <span className="text-xs text-slate-600 font-medium">{subject.name}</span>
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                        Special / Extra Class
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {sc.startTime} - {sc.endTime}
                        </span>
                      </span>
                      {sc.reason && <span>· {sc.reason}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        sc.subjectId,
                        selectedDate,
                        'present',
                        sc.id,
                        `${sc.startTime} - ${sc.endTime}`,
                        sc.reason,
                        true
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'present'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        sc.subjectId,
                        selectedDate,
                        'absent',
                        sc.id,
                        `${sc.startTime} - ${sc.endTime}`,
                        sc.reason,
                        true
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'absent'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-700'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      markAttendance(
                        sc.subjectId,
                        selectedDate,
                        'no_class',
                        sc.id,
                        `${sc.startTime} - ${sc.endTime}`,
                        sc.reason,
                        true
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                      status === 'no_class'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>Cancelled</span>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Ad-hoc or custom classes logged for today */}
          {adhocRecords.map((rec) => {
            const subject = activeSubjects.find((s) => s.id === rec.subjectId);
            if (!subject) return null;
            const colorClass = getSubjectColorClasses(subject.color);

            return (
              <div
                key={rec.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-2.5 h-10 rounded-full shrink-0 ${colorClass.bg}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{subject.code}</span>
                      <span className="text-xs text-slate-600 font-medium">{subject.name}</span>
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        Manual Entry
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      {rec.timeSlot && <span>{rec.timeSlot}</span>}
                      {rec.notes && <span>· Note: {rec.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded capitalize ${
                      rec.status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'absent'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {rec.status.replace('_', ' ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(rec.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                    title="Edit entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Subject-wise Attendance Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Subject-Wise Attendance</h2>
            <p className="text-xs text-slate-500">
              Clear 75% threshold indicator and safe bunk calculator for each course
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Full History Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectStatsList.map((stat) => {
            const { subject, present, absent, totalConducted, percentage, classesCanBunk, classesNeeded } =
              stat;
            const targetPct = subject.targetPercentage || 75;
            const isSafe = percentage >= targetPct;
            const colorClass = getSubjectColorClasses(subject.color);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Subject Info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${colorClass.bg}`} />
                      <div>
                        <span className="font-bold text-sm text-slate-900">{subject.code}</span>
                        <h3 className="text-xs text-slate-600 font-medium line-clamp-1">
                          {subject.name}
                        </h3>
                        {subject.professor && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            {subject.professor}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-xl font-bold tabular-nums ${
                          isSafe ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {percentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        Target {targetPct}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Progress Bar with 75% threshold needle marker */}
                  <div className="mt-4">
                    <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          percentage >= targetPct
                            ? 'bg-emerald-500'
                            : percentage >= targetPct - 10
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                    {/* Visual 75% target line */}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                      <span>0%</span>
                      <span className="text-slate-600 font-semibold">| 75% req</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Attendance Stats breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50/70 rounded-lg">
                    <div>
                      <span className="text-slate-400 text-[11px]">Attended / Held:</span>
                      <div className="font-bold text-slate-800 tabular-nums">
                        {present} / {totalConducted} classes
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Missed:</span>
                      <div className="font-bold text-rose-700 tabular-nums">{absent} classes</div>
                    </div>
                  </div>

                  {/* Bunk advice / Need advice */}
                  <div className="mt-3 text-xs">
                    {isSafe ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/70 px-2.5 py-1.5 rounded-md border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Can safely bunk{' '}
                          <strong className="font-bold tabular-nums">{classesCanBunk}</strong> next class
                          {classesCanBunk === 1 ? '' : 'es'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50/70 px-2.5 py-1.5 rounded-md border border-rose-100">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>
                          Must attend{' '}
                          <strong className="font-bold tabular-nums">{classesNeeded}</strong> class
                          {classesNeeded === 1 ? '' : 'es'} to recover
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Quick Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => markAttendance(subject.id, selectedDate, 'present')}
                      className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors cursor-pointer"
                      title="Quick record Present"
                    >
                      + Present
                    </button>
                    <button
                      type="button"
                      onClick={() => markAttendance(subject.id, selectedDate, 'absent')}
                      className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                      title="Quick record Absent"
                    >
                      + Absent
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('history')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors cursor-pointer"
                  >
                    History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Note Modal */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Add Class Note or Reason</h3>
            <p className="text-xs text-slate-500">
              Add medical leave details, professor substitution, or homework topics for this session.
            </p>
            <textarea
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="e.g. Doctor appointment note submitted, Quiz 1 attended..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-24"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteModalOpen(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
