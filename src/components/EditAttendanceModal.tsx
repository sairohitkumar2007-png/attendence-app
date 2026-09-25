import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types/attendance';
import { getTodayDateString } from '../utils/calculations';
import { CheckCircle2, XCircle, MinusCircle, Trash2 } from 'lucide-react';

interface EditAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordId?: string | null;
  defaultValues?: {
    date?: string;
    subjectId?: string;
    status?: AttendanceStatus;
    timeSlot?: string;
    notes?: string;
    isSpecialClass?: boolean;
  };
}

export const EditAttendanceModal: React.FC<EditAttendanceModalProps> = ({
  isOpen,
  onClose,
  recordId,
  defaultValues,
}) => {
  const {
    activeSubjects,
    activeRecords,
    markAttendance,
    updateRecord,
    deleteRecord,
  } = useAttendance();

  const [date, setDate] = useState(defaultValues?.date || getTodayDateString());
  const [subjectId, setSubjectId] = useState(defaultValues?.subjectId || activeSubjects[0]?.id || '');
  const [status, setStatus] = useState<AttendanceStatus>(defaultValues?.status || 'present');
  const [timeSlot, setTimeSlot] = useState(defaultValues?.timeSlot || '');
  const [notes, setNotes] = useState(defaultValues?.notes || '');
  const [isSpecialClass, setIsSpecialClass] = useState(defaultValues?.isSpecialClass || false);

  // If editing an existing record, populate its fields
  useEffect(() => {
    if (recordId) {
      const rec = activeRecords.find((r) => r.id === recordId);
      if (rec) {
        setDate(rec.date);
        setSubjectId(rec.subjectId);
        setStatus(rec.status);
        setTimeSlot(rec.timeSlot || '');
        setNotes(rec.notes || '');
        setIsSpecialClass(rec.isSpecialClass || false);
      }
    } else if (defaultValues) {
      if (defaultValues.date) setDate(defaultValues.date);
      if (defaultValues.subjectId) setSubjectId(defaultValues.subjectId);
      if (defaultValues.status) setStatus(defaultValues.status);
      if (defaultValues.timeSlot) setTimeSlot(defaultValues.timeSlot);
      if (defaultValues.notes) setNotes(defaultValues.notes);
      if (defaultValues.isSpecialClass !== undefined) setIsSpecialClass(defaultValues.isSpecialClass);
    }
  }, [recordId, defaultValues, activeRecords]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId || !date) return;

    if (recordId) {
      updateRecord(recordId, {
        date,
        subjectId,
        status,
        timeSlot: timeSlot.trim() || undefined,
        notes: notes.trim() || undefined,
        isSpecialClass,
      });
    } else {
      markAttendance(
        subjectId,
        date,
        status,
        undefined,
        timeSlot.trim() || undefined,
        notes.trim() || undefined,
        isSpecialClass
      );
    }

    onClose();
  };

  const handleDelete = () => {
    if (recordId) {
      deleteRecord(recordId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">
            {recordId ? 'Edit Attendance Record' : 'Log Class Attendance'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
              required
            >
              {activeSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Segmented Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attendance Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('present')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
                onClick={() => setStatus('absent')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
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
                onClick={() => setStatus('no_class')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                  status === 'no_class'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>No Class</span>
              </button>
            </div>
          </div>

          {/* Time Slot (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Time Slot (Optional)
            </label>
            <input
              type="text"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              placeholder="e.g. 10:00 - 11:00"
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Medical / Reason (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Medical certificate submitted, Quiz attended..."
              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Special Class Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSpecialClass}
              onChange={(e) => setIsSpecialClass(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-0"
            />
            <span>This is an extra / special weekend lecture</span>
          </label>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between">
            {recordId ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors cursor-pointer"
              >
                {recordId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
