import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  CalendarDays,
  Settings,
  ChevronDown,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenManageModal: () => void;
  onOpenNewRecordModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenManageModal,
  onOpenNewRecordModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    semesters,
    activeSemesterId,
    setActiveSemesterId,
    activeSemester,
    resetToDefaultData,
  } = useAttendance();

  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                RollCall
              </span>
            </button>

            {/* Semester Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSemesterMenuOpen(!isSemesterMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer"
                title="Switch Semester"
              >
                <span>{activeSemester?.name || 'Semester'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {isSemesterMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsSemesterMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-20">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Semesters
                    </div>
                    {semesters.map((sem) => (
                      <button
                        key={sem.id}
                        type="button"
                        onClick={() => {
                          setActiveSemesterId(sem.id);
                          setIsSemesterMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          sem.id === activeSemesterId
                            ? 'text-indigo-600 font-semibold bg-indigo-50/50'
                            : 'text-slate-700'
                        }`}
                      >
                        <span className="truncate">{sem.name}</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {sem.targetAttendancePct}% target
                        </span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsSemesterMenuOpen(false);
                          onOpenManageModal();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Manage Semesters & Subjects</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'calendar'
                  ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timetable')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'timetable'
                  ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Timetable
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Subject History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'analytics'
                  ? 'text-indigo-600 bg-indigo-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Statistics & Forecast
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewRecordModal}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Class</span>
              <span className="sm:hidden">Log</span>
            </button>

            <button
              type="button"
              onClick={onOpenManageModal}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Settings & Semester Management"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-100 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-2.5 py-1 rounded ${
              activeTab === 'calendar'
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-2.5 py-1 rounded ${
              activeTab === 'timetable'
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600'
            }`}
          >
            Timetable
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded ${
              activeTab === 'history'
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2.5 py-1 rounded ${
              activeTab === 'analytics'
                ? 'text-indigo-600 font-semibold bg-indigo-50'
                : 'text-slate-600'
            }`}
          >
            Stats
          </button>
        </div>
      </div>
    </header>
  );
};
