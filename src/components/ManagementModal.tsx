import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Subject, Semester, AcademicHoliday, SpecialClass } from '../types/attendance';
import { getSubjectColorClasses } from '../utils/calculations';
import {
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  Check,
} from 'lucide-react';

interface ManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_COLORS = [
  'indigo',
  'emerald',
  'blue',
  'amber',
  'rose',
  'violet',
  'cyan',
  'slate',
];

export const ManagementModal: React.FC<ManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    semesters,
    activeSemesterId,
    activeSemester,
    setActiveSemesterId,
    addSemester,
    updateSemester,
    deleteSemester,
    activeSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    activeHolidays,
    addHoliday,
    deleteHoliday,
    activeSpecialClasses,
    addSpecialClass,
    deleteSpecialClass,
    exportDataJson,
    importDataJson,
    resetToDefaultData,
  } = useAttendance();

  const [activeTab, setActiveTab] = useState<'subjects' | 'semesters' | 'holidays' | 'data'>('subjects');

  // New Subject Form
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subProf, setSubProf] = useState('');
  const [subColor, setSubColor] = useState('indigo');
  const [subTarget, setSubTarget] = useState(75);
  const [subCredits, setSubCredits] = useState(3);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // New Semester Form
  const [semName, setSemName] = useState('');
  const [semCode, setSemCode] = useState('');
  const [semStart, setSemStart] = useState('2026-08-17');
  const [semEnd, setSemEnd] = useState('2026-12-18');
  const [semTarget, setSemTarget] = useState(75);

  // New Holiday Form
  const [holName, setHolName] = useState('');
  const [holDate, setHolDate] = useState('2026-10-15');
  const [holType, setHolType] = useState<'holiday' | 'exam' | 'institutional' | 'break'>('holiday');
  const [holNote, setHolNote] = useState('');

  // New Special Class Form
  const [spSubId, setSpSubId] = useState(activeSubjects[0]?.id || '');
  const [spDate, setSpDate] = useState('2026-10-03');
  const [spStartTime, setSpStartTime] = useState('10:00');
  const [spEndTime, setSpEndTime] = useState('12:00');
  const [spReason, setSpReason] = useState('');

  // Import State
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handlers for Subjects
  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode.trim() || !subName.trim()) return;

    if (editingSubId) {
      updateSubject(editingSubId, {
        code: subCode.trim(),
        name: subName.trim(),
        professor: subProf.trim() || undefined,
        color: subColor,
        targetPercentage: subTarget,
        credits: subCredits,
      });
      setEditingSubId(null);
    } else {
      addSubject({
        code: subCode.trim(),
        name: subName.trim(),
        professor: subProf.trim() || undefined,
        color: subColor,
        targetPercentage: subTarget,
        credits: subCredits,
      });
    }

    setSubCode('');
    setSubName('');
    setSubProf('');
    setSubColor('indigo');
    setSubTarget(75);
    setSubCredits(3);
  };

  const handleEditSubjectClick = (sub: Subject) => {
    setEditingSubId(sub.id);
    setSubCode(sub.code);
    setSubName(sub.name);
    setSubProf(sub.professor || '');
    setSubColor(sub.color);
    setSubTarget(sub.targetPercentage || 75);
    setSubCredits(sub.credits || 3);
  };

  // Handlers for Semester
  const handleAddSemester = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semName.trim()) return;

    addSemester({
      name: semName.trim(),
      code: semCode.trim() || undefined,
      startDate: semStart,
      endDate: semEnd,
      targetAttendancePct: semTarget,
      isActive: true,
    });

    setSemName('');
    setSemCode('');
  };

  // Handlers for Holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName.trim() || !holDate) return;

    addHoliday({
      name: holName.trim(),
      date: holDate,
      type: holType,
      note: holNote.trim() || undefined,
    });

    setHolName('');
    setHolNote('');
  };

  // Handlers for Special Class
  const handleAddSpecialClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spSubId || !spDate) return;

    addSpecialClass({
      subjectId: spSubId,
      date: spDate,
      startTime: spStartTime,
      endTime: spEndTime,
      reason: spReason.trim() || undefined,
    });

    setSpReason('');
  };

  const handleExportDownload = () => {
    const json = exportDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rollcall-attendance-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const success = importDataJson(importJsonText);
    if (success) {
      setImportStatus('Data successfully imported!');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error: Invalid JSON format. Please verify file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Semester & Settings</h2>
            <p className="text-xs text-slate-500">
              Configure course subjects, university holidays, target attendance rules, and data backups.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-2 gap-1 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('subjects')}
            className={`px-3 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'subjects'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Subjects ({activeSubjects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('semesters')}
            className={`px-3 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'semesters'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Semesters ({semesters.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('holidays')}
            className={`px-3 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'holidays'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Holidays & Events
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-indigo-600 text-indigo-600 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="space-y-6">
              {/* Add/Edit Subject Form */}
              <form
                onSubmit={handleSaveSubject}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-900">
                    {editingSubId ? 'Edit Subject' : 'Add New Subject'}
                  </h3>
                  {editingSubId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubId(null);
                        setSubCode('');
                        setSubName('');
                        setSubProf('');
                      }}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Subject Code
                    </label>
                    <input
                      type="text"
                      value={subCode}
                      onChange={(e) => setSubCode(e.target.value)}
                      placeholder="e.g. CS 301, MATH 202"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      value={subName}
                      onChange={(e) => setSubName(e.target.value)}
                      placeholder="e.g. Algorithms, Thermodynamics"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Professor / Instructor
                    </label>
                    <input
                      type="text"
                      value={subProf}
                      onChange={(e) => setSubProf(e.target.value)}
                      placeholder="e.g. Dr. Alan Vance"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Req %
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={subTarget}
                      onChange={(e) => setSubTarget(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Credits
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={subCredits}
                      onChange={(e) => setSubCredits(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVAILABLE_COLORS.map((col) => {
                      const colorClass = getSubjectColorClasses(col);
                      const isSelected = subColor === col;
                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setSubColor(col)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                            colorClass.bg
                          } ${isSelected ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer transition-colors"
                  >
                    {editingSubId ? 'Update Subject' : 'Add Subject'}
                  </button>
                </div>
              </form>

              {/* Subject List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Semester Subjects ({activeSubjects.length})
                </h4>
                {activeSubjects.map((sub) => {
                  const colorClass = getSubjectColorClasses(sub.color);
                  return (
                    <div
                      key={sub.id}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3 h-3 rounded-full ${colorClass.bg}`} />
                        <div>
                          <span className="font-bold text-xs text-slate-900 mr-2">
                            {sub.code}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {sub.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Target: {sub.targetPercentage}% · Credits: {sub.credits || 3}{' '}
                            {sub.professor && `· ${sub.professor}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditSubjectClick(sub)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="Edit subject"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSubject(sub.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SEMESTERS */}
          {activeTab === 'semesters' && (
            <div className="space-y-6">
              {/* Add Semester Form */}
              <form
                onSubmit={handleAddSemester}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3"
              >
                <h3 className="font-bold text-xs text-slate-900">Create New Semester</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Semester Name
                    </label>
                    <input
                      type="text"
                      value={semName}
                      onChange={(e) => setSemName(e.target.value)}
                      placeholder="e.g. Spring 2027 (Semester VI)"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Attendance %
                    </label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      value={semTarget}
                      onChange={(e) => setSemTarget(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={semStart}
                      onChange={(e) => setSemStart(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={semEnd}
                      onChange={(e) => setSemEnd(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
                  >
                    Add Semester
                  </button>
                </div>
              </form>

              {/* Semesters List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Configured Semesters
                </h4>
                {semesters.map((sem) => (
                  <div
                    key={sem.id}
                    className={`p-3 border rounded-lg flex items-center justify-between ${
                      sem.id === activeSemesterId
                        ? 'border-indigo-500 bg-indigo-50/30'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{sem.name}</span>
                        {sem.id === activeSemesterId && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                        {sem.startDate} to {sem.endDate} · Requirement: {sem.targetAttendancePct}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {sem.id !== activeSemesterId && (
                        <button
                          type="button"
                          onClick={() => setActiveSemesterId(sem.id)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer"
                        >
                          Switch To
                        </button>
                      )}
                      {semesters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => deleteSemester(sem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                          title="Delete semester"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HOLIDAYS & SPECIAL CLASSES */}
          {activeTab === 'holidays' && (
            <div className="space-y-6">
              {/* Add Holiday Form */}
              <form
                onSubmit={handleAddHoliday}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-lg space-y-3"
              >
                <h3 className="font-bold text-xs text-slate-900">Add Academic Holiday</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Event / Holiday Name
                    </label>
                    <input
                      type="text"
                      value={holName}
                      onChange={(e) => setHolName(e.target.value)}
                      placeholder="e.g. Fall Break, Annual Fest"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={holDate}
                      onChange={(e) => setHolDate(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={holType}
                      onChange={(e) => setHolType(e.target.value as any)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                    >
                      <option value="holiday">National / State Holiday</option>
                      <option value="institutional">College Fest / Institutional</option>
                      <option value="exam">Exam / Study Leave</option>
                      <option value="break">Mid-Term / Recess</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    value={holNote}
                    onChange={(e) => setHolNote(e.target.value)}
                    placeholder="Optional details or instructions..."
                    className="w-3/4 text-xs p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
                  >
                    Add Holiday
                  </button>
                </div>
              </form>

              {/* Holidays List */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Semester Holidays ({activeHolidays.length})
                </h4>
                {activeHolidays.map((h) => (
                  <div
                    key={h.id}
                    className="p-3 bg-purple-50/50 border border-purple-200 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-purple-900">{h.name}</span>
                        <span className="text-[10px] text-purple-600 capitalize bg-purple-100 px-1.5 py-0.5 rounded">
                          {h.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-700 block mt-0.5 font-mono">
                        {h.date} {h.note && `· ${h.note}`}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteHoliday(h.id)}
                      className="p-1 text-purple-400 hover:text-rose-600 rounded"
                      title="Remove holiday"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP & RESET */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs text-slate-900">Export & Backup</h3>
                <p className="text-xs text-slate-500">
                  Save your attendance records and schedule as a JSON backup file to keep your data safe.
                </p>
                <button
                  type="button"
                  onClick={handleExportDownload}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <h3 className="font-bold text-xs text-slate-900">Import Data</h3>
                <p className="text-xs text-slate-500">
                  Paste previously exported JSON data to restore your attendance records.
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON content here..."
                  className="w-full text-xs font-mono p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 h-20"
                />
                {importStatus && (
                  <p className="text-xs font-medium text-indigo-700">{importStatus}</p>
                )}
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Restore from JSON</span>
                </button>
              </div>

              <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-200 space-y-2">
                <h3 className="font-bold text-xs text-rose-900">Reset Demo Data</h3>
                <p className="text-xs text-rose-700">
                  Reload the initial Fall 2026 realistic sample semester data. (Replaces current records).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset to initial sample Fall 2026 data?')) {
                      resetToDefaultData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-50 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset to Sample Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
