import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  DAYS_SHORT,
  formatDatePretty,
  getDayOfWeekFromDate,
  getSubjectColorClasses,
} from '../utils/calculations';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Plus,
  Clock,
  MapPin,
  Sparkles,
  Edit2,
  Info,
} from 'lucide-react';

interface CalendarViewProps {
  onOpenEditModal: (recordId?: string, defaultValues?: any) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenEditModal }) => {
  const {
    activeSemester,
    activeSubjects,
    activeRecords,
    activeTimetable,
    activeHolidays,
    activeSpecialClasses,
    selectedDate,
    setSelectedDate,
    markAttendance,
    bulkMarkDay,
  } = useAttendance();

  // Current calendar month view state (year and month, 0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || 2026;
  });

  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return m !== undefined ? m - 1 : 8; // September is 8
  });

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    const today = '2026-09-25';
    const [y, m] = today.split('-').map(Number);
    setCurrentYear(y);
    setCurrentMonth(m - 1);
    setSelectedDate(today);
  };

  // Month metadata
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' }
  );

  // Generate calendar days grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      dayOfWeek: number;
    }> = [];

    // Preceding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 12 : currentMonth;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevY}-${String(prevM).padStart(2, '0')}-${String(
        dayNum
      ).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        dayOfWeek: (firstDayIndex - 1 - i) % 7,
      });
    }

    // Days of current month
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        '0'
      )}-${String(d).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        dayOfWeek: new Date(currentYear, currentMonth, d).getDay(),
      });
    }

    // Remaining slots to fill complete 6-week (42) or 5-week (35) grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let r = 1; r <= remaining; r++) {
      const nextM = currentMonth === 11 ? 1 : currentMonth + 2;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextY}-${String(nextM).padStart(2, '0')}-${String(
        r
      ).padStart(2, '0')}`;
      days.push({
        dateStr,
        dayNumber: r,
        isCurrentMonth: false,
        dayOfWeek: (days.length) % 7,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map each day's attendance status
  const getDayStatus = (dateStr: string) => {
    // Check holiday
    const holiday = activeHolidays.find((h) => h.date === dateStr);
    if (holiday) {
      return { type: 'holiday' as const, holiday };
    }

    const dayRecords = activeRecords.filter((r) => r.date === dateStr);
    if (dayRecords.length === 0) {
      // Check if day is weekend or has normal slots
      const dow = getDayOfWeekFromDate(dateStr);
      const scheduled = activeTimetable.filter((t) => t.dayOfWeek === dow);
      if (scheduled.length === 0) {
        return { type: 'none' as const };
      }
      return { type: 'unmarked' as const, count: scheduled.length };
    }

    let presents = 0;
    let absents = 0;
    let noClasses = 0;

    for (const r of dayRecords) {
      if (r.status === 'present') presents++;
      else if (r.status === 'absent') absents++;
      else if (r.status === 'no_class') noClasses++;
    }

    if (presents > 0 && absents === 0) {
      return { type: 'present' as const, presents, total: presents + absents };
    }
    if (absents > 0 && presents === 0) {
      return { type: 'absent' as const, absents, total: presents + absents };
    }
    if (presents > 0 && absents > 0) {
      return { type: 'partial' as const, presents, absents, total: presents + absents };
    }
    if (noClasses > 0 && presents === 0 && absents === 0) {
      return { type: 'no_class' as const, noClasses };
    }

    return { type: 'none' as const };
  };

  // Selected Day Detailed Breakdown
  const selectedDayInfo = useMemo(() => {
    const dow = getDayOfWeekFromDate(selectedDate);
    const holiday = activeHolidays.find((h) => h.date === selectedDate);
    const slots = activeTimetable
      .filter((t) => t.dayOfWeek === dow)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    const special = activeSpecialClasses.filter((sc) => sc.date === selectedDate);
    const records = activeRecords.filter((r) => r.date === selectedDate);

    return {
      date: selectedDate,
      dayOfWeek: dow,
      holiday,
      slots,
      special,
      records,
    };
  }, [selectedDate, activeTimetable, activeHolidays, activeSpecialClasses, activeRecords]);

  // Monthly stats summary
  const monthStats = useMemo(() => {
    const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    const monthRecords = activeRecords.filter((r) => r.date.startsWith(monthPrefix));

    let presents = 0;
    let absents = 0;
    let noClass = 0;

    for (const r of monthRecords) {
      if (r.status === 'present') presents++;
      else if (r.status === 'absent') absents++;
      else if (r.status === 'no_class') noClass++;
    }

    const total = presents + absents;
    const pct = total === 0 ? 100 : Number(((presents / total) * 100).toFixed(1));

    return { presents, absents, noClass, total, pct };
  }, [activeRecords, currentYear, currentMonth]);

  return (
    <div className="space-y-6 pb-12">
      {/* Calendar Header with Controls & Monthly Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{monthName}</h2>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                Monthly Rate: <strong className="text-slate-900 tabular-nums">{monthStats.pct}%</strong>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any day to inspect class schedules, modify attendance entries, or view holiday notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={jumpToToday}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              Jump to Today
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 flex-wrap text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Present (Full)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Partial Attendance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>Holiday / Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>No Class / Cancelled</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Day Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 text-center">
            {DAYS_SHORT.map((day, idx) => (
              <div
                key={day}
                className={`py-2.5 text-xs font-semibold ${
                  idx === 0 || idx === 6 ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {calendarDays.map((cell) => {
              const status = getDayStatus(cell.dateStr);
              const isSelected = selectedDate === cell.dateStr;
              const isToday = cell.dateStr === '2026-09-25';

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[78px] sm:min-h-[92px] p-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 text-slate-300'
                      : 'hover:bg-slate-50 text-slate-800'
                  } ${
                    isSelected
                      ? 'ring-2 ring-indigo-600 ring-inset bg-indigo-50/30 z-10'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tabular-nums inline-block w-6 h-6 leading-6 text-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : isSelected
                          ? 'text-indigo-600 font-bold'
                          : ''
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Status Dot / Indicator */}
                    {status.type === 'present' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="All classes attended" />
                    )}
                    {status.type === 'partial' && (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Partial attendance" />
                    )}
                    {status.type === 'absent' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="All classes missed" />
                    )}
                    {status.type === 'holiday' && (
                      <span className="w-2 h-2 rounded-full bg-purple-500" title={status.holiday.name} />
                    )}
                    {status.type === 'no_class' && (
                      <span className="w-2 h-2 rounded-full bg-slate-400" title="No class / cancelled" />
                    )}
                  </div>

                  {/* Micro label in cell */}
                  <div className="mt-1">
                    {status.type === 'holiday' && (
                      <span className="text-[10px] text-purple-700 font-medium block truncate">
                        {status.holiday.name}
                      </span>
                    )}
                    {status.type === 'present' && (
                      <span className="text-[10px] text-emerald-700 font-medium block tabular-nums">
                        {status.presents} attended
                      </span>
                    )}
                    {status.type === 'partial' && (
                      <span className="text-[10px] text-amber-700 font-medium block tabular-nums">
                        {status.presents}P · {status.absents}A
                      </span>
                    )}
                    {status.type === 'absent' && (
                      <span className="text-[10px] text-rose-700 font-medium block tabular-nums">
                        {status.absents} absent
                      </span>
                    )}
                    {status.type === 'no_class' && (
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Cancelled
                      </span>
                    )}
                    {status.type === 'unmarked' && cell.isCurrentMonth && (
                      <span className="text-[10px] text-slate-400 font-medium block tabular-nums">
                        {status.count} classes
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail Panel (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Day Details
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">
                  {formatDatePretty(selectedDayInfo.date)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  onOpenEditModal(undefined, {
                    date: selectedDate,
                    status: 'present',
                  })
                }
                className="px-2.5 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title="Add ad-hoc class for this date"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class</span>
              </button>
            </div>

            {/* Holiday notice if present */}
            {selectedDayInfo.holiday && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200 text-purple-900">
                <span className="text-xs font-bold block">
                  {selectedDayInfo.holiday.name}
                </span>
                <span className="text-[11px] text-purple-700 capitalize">
                  {selectedDayInfo.holiday.type}
                </span>
                {selectedDayInfo.holiday.note && (
                  <p className="text-xs text-purple-800 mt-1">{selectedDayInfo.holiday.note}</p>
                )}
              </div>
            )}

            {/* Classes List */}
            <div className="mt-4 space-y-3">
              {selectedDayInfo.slots.length === 0 &&
                selectedDayInfo.special.length === 0 &&
                selectedDayInfo.records.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <p className="text-xs">No scheduled timetable slots on this day.</p>
                  </div>
                )}

              {/* Normal Timetable Slots */}
              {selectedDayInfo.slots.map((slot) => {
                const sub = activeSubjects.find((s) => s.id === slot.subjectId);
                if (!sub) return null;
                const rec = selectedDayInfo.records.find(
                  (r) => r.subjectId === slot.subjectId && r.slotId === slot.id
                ) || selectedDayInfo.records.find((r) => r.subjectId === slot.subjectId);

                const colorClass = getSubjectColorClasses(sub.color);

                return (
                  <div
                    key={slot.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${colorClass.bg}`} />
                        <span className="font-bold text-xs text-slate-900">{sub.code}</span>
                        <span className="text-xs text-slate-600 truncate max-w-[120px]">
                          {sub.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {slot.startTime}
                      </span>
                    </div>

                    {rec?.notes && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">
                        Note: {rec.notes}
                      </p>
                    )}

                    {/* Status Toggles */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
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
                        className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                          rec?.status === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                        }`}
                      >
                        Present
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
                        className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                          rec?.status === 'absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                        }`}
                      >
                        Absent
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
                        className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                          rec?.status === 'no_class'
                            ? 'bg-slate-700 text-white'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        No Class
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Special Classes */}
              {selectedDayInfo.special.map((sc) => {
                const sub = activeSubjects.find((s) => s.id === sc.subjectId);
                if (!sub) return null;
                const rec = selectedDayInfo.records.find(
                  (r) => r.subjectId === sc.subjectId && r.slotId === sc.id
                );

                return (
                  <div
                    key={sc.id}
                    className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-900">
                        {sub.code} (Special Class)
                      </span>
                      <span className="text-[11px] text-slate-500 tabular-nums">
                        {sc.startTime} - {sc.endTime}
                      </span>
                    </div>
                    {sc.reason && (
                      <p className="text-[11px] text-indigo-700 mt-1">{sc.reason}</p>
                    )}

                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-indigo-100">
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
                        className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                          rec?.status === 'present'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        Present
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
                        className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                          rec?.status === 'absent'
                            ? 'bg-rose-600 text-white'
                            : 'bg-white text-slate-700 border border-slate-200'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Quick Bulk Action */}
          <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => bulkMarkDay(selectedDate, 'present')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => bulkMarkDay(selectedDate, 'no_class')}
              className="text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              Mark Day Cancelled
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
