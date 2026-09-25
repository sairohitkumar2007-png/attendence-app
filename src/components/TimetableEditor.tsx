import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TimetableSlot, Subject } from '../types/attendance';
import { DAYS_OF_WEEK, getSubjectColorClasses } from '../utils/calculations';
import {
  Plus,
  Clock,
  MapPin,
  Trash2,
  Edit2,
  Calendar,
  AlertCircle,
  Check,
} from 'lucide-react';

export const TimetableEditor: React.FC = () => {
  const {
    activeTimetable,
    activeSubjects,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
  } = useAttendance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  // Form State
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday default
  const [subjectId, setSubjectId] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [room, setRoom] = useState('');

  // Include Saturday in view toggle
  const [showSaturday, setShowSaturday] = useState(false);

  // Display days: 1 to 5 (Mon-Fri), or 1 to 6 (Mon-Sat)
  const displayDays = showSaturday ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];

  const handleOpenAddModal = (defaultDay?: number) => {
    setEditingSlotId(null);
    setDayOfWeek(defaultDay ?? 1);
    setSubjectId(activeSubjects[0]?.id || '');
    setStartTime('09:00');
    setEndTime('10:00');
    setRoom('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setDayOfWeek(slot.dayOfWeek);
    setSubjectId(slot.subjectId);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setRoom(slot.room || '');
    setIsModalOpen(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    if (editingSlotId) {
      updateTimetableSlot(editingSlotId, {
        dayOfWeek,
        subjectId,
        startTime,
        endTime,
        room: room.trim() || undefined,
      });
    } else {
      addTimetableSlot({
        dayOfWeek,
        subjectId,
        startTime,
        endTime,
        room: room.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Group slots by day
  const getSlotsForDay = (day: number) => {
    return activeTimetable
      .filter((s) => s.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Calculate total classes per week
  const totalWeeklySlots = activeTimetable.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Weekly Class Timetable</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded tabular-nums">
              {totalWeeklySlots} classes / week
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure your regular class schedule. Daily attendance slots are automatically populated from this schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none bg-slate-100 px-2.5 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
            <input
              type="checkbox"
              checked={showSaturday}
              onChange={(e) => setShowSaturday(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>Include Saturday</span>
          </label>

          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        </div>
      </div>

      {/* Week Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {displayDays.map((dayNum) => {
          const slots = getSlotsForDay(dayNum);
          const dayName = DAYS_OF_WEEK[dayNum];

          return (
            <div
              key={dayNum}
              className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col min-h-[380px]"
            >
              {/* Day Header */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{dayName}</h3>
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    {slots.length} class{slots.length === 1 ? '' : 'es'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(dayNum)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                  title={`Add class on ${dayName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Day Slots List */}
              <div className="p-3 flex-1 space-y-2.5 overflow-y-auto">
                {slots.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-400">No classes scheduled</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddModal(dayNum)}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:underline cursor-pointer"
                    >
                      + Add slot
                    </button>
                  </div>
                ) : (
                  slots.map((slot) => {
                    const subject = activeSubjects.find((s) => s.id === slot.subjectId);
                    if (!subject) return null;
                    const colorClass = getSubjectColorClasses(subject.color);

                    return (
                      <div
                        key={slot.id}
                        className="group p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all bg-white relative"
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${colorClass.bg}`} />
                            <span className="font-bold text-xs text-slate-900">
                              {subject.code}
                            </span>
                          </div>

                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(slot)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title="Edit slot"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteTimetableSlot(slot.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete slot"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                          {subject.name}
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </span>
                          {slot.room && (
                            <span className="truncate max-w-[80px]" title={slot.room}>
                              {slot.room}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editingSlotId ? 'Edit Timetable Slot' : 'Add Timetable Slot'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4">
              {/* Day of Week */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                  <option value={6}>Saturday</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  required
                >
                  {activeSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.code} - {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Room / Hall */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classroom / Lab Location (Optional)
                </label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g. Hall A-101, Lab 3"
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
                >
                  {editingSlotId ? 'Save Changes' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
