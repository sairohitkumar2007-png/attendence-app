import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  formatDatePretty,
  getSubjectColorClasses,
  getAttendanceStatusColor,
} from '../utils/calculations';
import { AttendanceStatus } from '../types/attendance';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Edit2,
  Trash2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Calendar,
} from 'lucide-react';

interface SubjectHistoryViewProps {
  onOpenEditModal: (recordId?: string, defaultValues?: any) => void;
}

export const SubjectHistoryView: React.FC<SubjectHistoryViewProps> = ({
  onOpenEditModal,
}) => {
  const {
    activeSubjects,
    activeRecords,
    subjectStatsList,
    deleteRecord,
    quickToggleStatus,
  } = useAttendance();

  // Filters
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected subject stats
  const activeSubjectStat = useMemo(() => {
    if (selectedSubjectFilter === 'all') return null;
    return subjectStatsList.find((s) => s.subject.id === selectedSubjectFilter);
  }, [selectedSubjectFilter, subjectStatsList]);

  // Filtered attendance records sorted by date descending (newest first)
  const filteredRecords = useMemo(() => {
    return activeRecords
      .filter((rec) => {
        if (selectedSubjectFilter !== 'all' && rec.subjectId !== selectedSubjectFilter) {
          return false;
        }
        if (selectedStatusFilter !== 'all' && rec.status !== selectedStatusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const sub = activeSubjects.find((s) => s.id === rec.subjectId);
          const matchSub = sub?.name.toLowerCase().includes(q) || sub?.code.toLowerCase().includes(q);
          const matchDate = rec.date.includes(q);
          const matchNote = rec.notes?.toLowerCase().includes(q);
          if (!matchSub && !matchDate && !matchNote) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [activeRecords, selectedSubjectFilter, selectedStatusFilter, searchQuery, activeSubjects]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Attendance History & Audit</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded tabular-nums">
              {filteredRecords.length} records logged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review your complete attendance log throughout the semester. Edit or correct any inaccurate records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenEditModal()}
          className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Record</span>
        </button>
      </div>

      {/* Selected Subject Spotlight Card (if single subject chosen) */}
      {activeSubjectStat && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-12 rounded-full shrink-0 ${
                  getSubjectColorClasses(activeSubjectStat.subject.color).bg
                }`}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900">
                    {activeSubjectStat.subject.code}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {activeSubjectStat.subject.name}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Professor: {activeSubjectStat.subject.professor || 'Not specified'} ·{' '}
                  Target: {activeSubjectStat.subject.targetPercentage}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 self-start sm:self-auto">
              <div className="text-right">
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    activeSubjectStat.percentage >= activeSubjectStat.subject.targetPercentage
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {activeSubjectStat.percentage}%
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {activeSubjectStat.present} / {activeSubjectStat.totalConducted} classes attended
                </span>
              </div>

              <div className="border-l border-slate-200 pl-6">
                {activeSubjectStat.percentage >= activeSubjectStat.subject.targetPercentage ? (
                  <div className="text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>
                      Can safely miss{' '}
                      <strong className="font-bold">{activeSubjectStat.classesCanBunk}</strong>{' '}
                      more classes
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>
                      Must attend{' '}
                      <strong className="font-bold">{activeSubjectStat.classesNeeded}</strong>{' '}
                      classes to reach 75%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by notes, subject, or date (YYYY-MM-DD)..."
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Filter Dropdown */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="all">All Subjects ({activeSubjects.length})</option>
            {activeSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium text-slate-700 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present Only</option>
            <option value="absent">Absent Only</option>
            <option value="no_class">No Class Only</option>
          </select>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">No records found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filter criteria or log a new attendance record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Notes / Remarks</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => {
                  const subject = activeSubjects.find((s) => s.id === rec.subjectId);
                  const colorClass = subject
                    ? getSubjectColorClasses(subject.color)
                    : getSubjectColorClasses('slate');

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">
                          {formatDatePretty(rec.date)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.date}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${colorClass.bg}`} />
                          <span className="font-bold text-slate-900">
                            {subject?.code || 'N/A'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {subject?.name}
                        </span>
                      </td>

                      {/* Time Slot */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                        {rec.timeSlot || 'Scheduled'}
                        {rec.isSpecialClass && (
                          <span className="text-[10px] text-indigo-600 font-semibold ml-1">
                            (Special)
                          </span>
                        )}
                      </td>

                      {/* Status with quick 1-click toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() =>
                            quickToggleStatus(
                              rec.subjectId,
                              rec.date,
                              rec.status,
                              rec.slotId,
                              rec.timeSlot
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                            rec.status === 'present'
                              ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : rec.status === 'absent'
                              ? 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status (Present -> Absent -> No Class)"
                        >
                          {rec.status === 'present' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {rec.status === 'absent' && (
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {rec.status === 'no_class' && (
                            <MinusCircle className="w-3.5 h-3.5 text-slate-500" />
                          )}
                          <span className="capitalize">
                            {rec.status.replace('_', ' ')}
                          </span>
                        </button>
                      </td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-slate-600">
                        {rec.notes ? (
                          <span className="italic text-slate-700">{rec.notes}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(rec.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                            title="Edit entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecord(rec.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
