import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  DAYS_OF_WEEK,
  getDayOfWeekFromDate,
  calculateSafeBunks,
  calculateClassesNeeded,
  getSubjectColorClasses,
} from '../utils/calculations';
import {
  TrendingUp,
  Calendar,
  Clock,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Percent,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
    activeSubjects,
    activeRecords,
    activeSemester,
    subjectStatsList,
    overallStats,
  } = useAttendance();

  // "What-if" Simulator State
  const [simSubjectId, setSimSubjectId] = useState<string>('overall');
  const [futureAttend, setFutureAttend] = useState<number>(5);
  const [futureMiss, setFutureMiss] = useState<number>(1);

  // 1. Monthly Statistics Breakdown
  const monthlyStats = useMemo(() => {
    const map = new Map<string, { present: number; absent: number; total: number }>();

    for (const r of activeRecords) {
      const monthKey = r.date.substring(0, 7); // YYYY-MM
      if (!map.has(monthKey)) {
        map.set(monthKey, { present: 0, absent: 0, total: 0 });
      }
      const data = map.get(monthKey)!;
      if (r.status === 'present') {
        data.present++;
        data.total++;
      } else if (r.status === 'absent') {
        data.absent++;
        data.total++;
      }
    }

    const sortedMonths = Array.from(map.keys()).sort();
    return sortedMonths.map((mKey) => {
      const [year, month] = mKey.split('-').map(Number);
      const name = new Date(year, month - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
      const data = map.get(mKey)!;
      const pct = data.total === 0 ? 100 : Number(((data.present / data.total) * 100).toFixed(1));
      return {
        monthKey: mKey,
        name,
        present: data.present,
        absent: data.absent,
        total: data.total,
        pct,
      };
    });
  }, [activeRecords]);

  // 2. Day-of-Week Pattern Analysis (Mon-Fri)
  const dayOfWeekStats = useMemo(() => {
    const days = [1, 2, 3, 4, 5]; // Mon to Fri
    return days.map((d) => {
      let present = 0;
      let absent = 0;

      for (const r of activeRecords) {
        const dow = getDayOfWeekFromDate(r.date);
        if (dow === d) {
          if (r.status === 'present') present++;
          else if (r.status === 'absent') absent++;
        }
      }

      const total = present + absent;
      const pct = total === 0 ? 100 : Number(((present / total) * 100).toFixed(1));

      return {
        dayNum: d,
        dayName: DAYS_OF_WEEK[d],
        present,
        absent,
        total,
        pct,
      };
    });
  }, [activeRecords]);

  // 3. What-if Projection Calculation
  const simulationResult = useMemo(() => {
    const targetPct =
      simSubjectId === 'overall'
        ? overallStats.targetPercentage
        : activeSubjects.find((s) => s.id === simSubjectId)?.targetPercentage || 75;

    let basePresent = 0;
    let baseTotal = 0;

    if (simSubjectId === 'overall') {
      basePresent = overallStats.present;
      baseTotal = overallStats.totalConducted;
    } else {
      const stat = subjectStatsList.find((s) => s.subject.id === simSubjectId);
      if (stat) {
        basePresent = stat.present;
        baseTotal = stat.totalConducted;
      }
    }

    const currentPct = baseTotal === 0 ? 100 : Number(((basePresent / baseTotal) * 100).toFixed(1));
    const projectedPresent = basePresent + futureAttend;
    const projectedTotal = baseTotal + futureAttend + futureMiss;
    const projectedPct =
      projectedTotal === 0
        ? 100
        : Number(((projectedPresent / projectedTotal) * 100).toFixed(1));

    const isProjectedSafe = projectedPct >= targetPct;
    const delta = Number((projectedPct - currentPct).toFixed(1));

    return {
      currentPct,
      projectedPct,
      projectedPresent,
      projectedTotal,
      targetPct,
      isProjectedSafe,
      delta,
    };
  }, [simSubjectId, futureAttend, futureMiss, overallStats, subjectStatsList, activeSubjects]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-900">Attendance Analytics & Trends</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Detailed monthly performance, day-of-week trends, and real-time attendance projections.
        </p>
      </div>

      {/* 1. What-If Planner & Simulator */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900">
                Attendance Projection Calculator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate future classes to know exactly how attending or skipping upcoming sessions impacts your percentage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Controls Form */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Scope / Subject
              </label>
              <select
                value={simSubjectId}
                onChange={(e) => setSimSubjectId(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="overall">Overall Attendance (All Subjects)</option>
                {activeSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  Classes you plan to ATTEND:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={futureAttend}
                    onChange={(e) => setFutureAttend(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <span className="w-8 text-center text-sm font-bold text-emerald-700 tabular-nums">
                    {futureAttend}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Classes you plan to MISS:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={futureMiss}
                    onChange={(e) => setFutureMiss(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <span className="w-8 text-center text-sm font-bold text-rose-700 tabular-nums">
                    {futureMiss}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Projection Result Card */}
          <div className="lg:col-span-6 bg-slate-50/70 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Projected Attendance
              </span>

              <div className="flex items-baseline gap-4 mt-2">
                <span
                  className={`text-3xl font-bold tabular-nums ${
                    simulationResult.isProjectedSafe ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {simulationResult.projectedPct}%
                </span>
                <span className="text-xs text-slate-500">
                  Current:{' '}
                  <strong className="text-slate-800 tabular-nums">
                    {simulationResult.currentPct}%
                  </strong>{' '}
                  ({simulationResult.delta >= 0 ? `+${simulationResult.delta}%` : `${simulationResult.delta}%`})
                </span>
              </div>

              <div className="mt-3">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      simulationResult.isProjectedSafe ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, simulationResult.projectedPct)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0%</span>
                  <span className="text-slate-700 font-bold">
                    | {simulationResult.targetPct}% Requirement
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs">
              {simulationResult.isProjectedSafe ? (
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Your attendance will remain safe and above the {simulationResult.targetPct}% threshold!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Warning: This scenario would drop your attendance below {simulationResult.targetPct}%.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Monthly Attendance Statistics Grid */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-1">
          Monthly Attendance Breakdown
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Tracking your consistency across each academic month of the semester.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {monthlyStats.map((item) => (
            <div
              key={item.monthKey}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-sm text-slate-900">{item.name}</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span
                    className={`text-2xl font-bold tabular-nums ${
                      item.pct >= 75 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {item.pct}%
                  </span>
                  <span className="text-xs text-slate-400">attendance</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Present classes:</span>
                  <strong className="text-emerald-700 tabular-nums">{item.present}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Absent classes:</span>
                  <strong className="text-rose-700 tabular-nums">{item.absent}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total held:</span>
                  <strong className="tabular-nums">{item.total}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Day of the Week Trend Analysis */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 mb-1">
          Day-of-Week Attendance Patterns
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          See which days of the week have your highest attendance and where absences tend to concentrate.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {dayOfWeekStats.map((item) => (
            <div
              key={item.dayNum}
              className="p-3.5 rounded-lg border border-slate-200 text-center"
            >
              <span className="text-xs font-bold text-slate-900 block">{item.dayName}</span>
              <div
                className={`text-xl font-bold mt-2 tabular-nums ${
                  item.pct >= 75 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {item.pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-1 tabular-nums">
                {item.present}P / {item.absent}A
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
