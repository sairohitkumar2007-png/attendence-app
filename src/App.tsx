import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { TimetableEditor } from './components/TimetableEditor';
import { SubjectHistoryView } from './components/SubjectHistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { EditAttendanceModal } from './components/EditAttendanceModal';
import { ManagementModal } from './components/ManagementModal';

function MainAppContent() {
  const { activeTab } = useAttendance();

  // Modal states
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [editModalData, setEditModalData] = useState<{
    isOpen: boolean;
    recordId?: string | null;
    defaultValues?: any;
  }>({
    isOpen: false,
    recordId: null,
    defaultValues: undefined,
  });

  const handleOpenEditModal = (recordId?: string, defaultValues?: any) => {
    setEditModalData({
      isOpen: true,
      recordId: recordId || null,
      defaultValues,
    });
  };

  const handleCloseEditModal = () => {
    setEditModalData({
      isOpen: false,
      recordId: null,
      defaultValues: undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onOpenManageModal={() => setIsManageModalOpen(true)}
        onOpenNewRecordModal={() => handleOpenEditModal()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView onOpenEditModal={handleOpenEditModal} />
        )}
        {activeTab === 'calendar' && (
          <CalendarView onOpenEditModal={handleOpenEditModal} />
        )}
        {activeTab === 'timetable' && <TimetableEditor />}
        {activeTab === 'history' && (
          <SubjectHistoryView onOpenEditModal={handleOpenEditModal} />
        )}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">RollCall</span>
            <span>·</span>
            <span>Student Attendance Tracker</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>75% Minimum Attendance Standard</span>
            <span>·</span>
            <span>Auto-saved to device</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <EditAttendanceModal
        isOpen={editModalData.isOpen}
        onClose={handleCloseEditModal}
        recordId={editModalData.recordId}
        defaultValues={editModalData.defaultValues}
      />

      <ManagementModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <MainAppContent />
    </AttendanceProvider>
  );
}
