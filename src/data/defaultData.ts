import {
  Semester,
  Subject,
  TimetableSlot,
  AttendanceRecord,
  AcademicHoliday,
  SpecialClass,
} from '../types/attendance';

export const INITIAL_SEMESTERS: Semester[] = [
  {
    id: 'sem-fall-2026',
    name: 'Fall 2026 (Semester V)',
    code: 'SEM-5',
    startDate: '2026-08-17',
    endDate: '2026-12-18',
    targetAttendancePct: 75,
    isActive: true,
  },
  {
    id: 'sem-spring-2026',
    name: 'Spring 2026 (Semester IV)',
    code: 'SEM-4',
    startDate: '2026-01-12',
    endDate: '2026-05-20',
    targetAttendancePct: 75,
    isActive: false,
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-cs301',
    semesterId: 'sem-fall-2026',
    code: 'CS 301',
    name: 'Data Structures & Algorithms',
    professor: 'Dr. Alan Vance',
    color: 'indigo',
    targetPercentage: 75,
    credits: 4,
  },
  {
    id: 'sub-cs302',
    semesterId: 'sem-fall-2026',
    code: 'CS 302',
    name: 'Database Management Systems',
    professor: 'Prof. Sarah Jenkins',
    color: 'emerald',
    targetPercentage: 75,
    credits: 4,
  },
  {
    id: 'sub-cs303',
    semesterId: 'sem-fall-2026',
    code: 'CS 303',
    name: 'Operating Systems & Architecture',
    professor: 'Dr. Marcus Thorne',
    color: 'blue',
    targetPercentage: 75,
    credits: 3,
  },
  {
    id: 'sub-cs304',
    semesterId: 'sem-fall-2026',
    code: 'CS 304',
    name: 'Computer Networks',
    professor: 'Dr. Priya Sharma',
    color: 'amber',
    targetPercentage: 75,
    credits: 3,
  },
  {
    id: 'sub-ma301',
    semesterId: 'sem-fall-2026',
    code: 'MA 301',
    name: 'Probability & Engineering Statistics',
    professor: 'Prof. David Lin',
    color: 'rose',
    targetPercentage: 75,
    credits: 3,
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  // Monday (1)
  {
    id: 'tt-mon-1',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 1,
    subjectId: 'sub-cs301',
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall A-101',
  },
  {
    id: 'tt-mon-2',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 1,
    subjectId: 'sub-cs302',
    startTime: '10:15',
    endTime: '11:15',
    room: 'Lab 2',
  },
  {
    id: 'tt-mon-3',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 1,
    subjectId: 'sub-cs303',
    startTime: '11:30',
    endTime: '12:30',
    room: 'Hall B-205',
  },
  {
    id: 'tt-mon-4',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 1,
    subjectId: 'sub-ma301',
    startTime: '14:00',
    endTime: '15:15',
    room: 'Hall C-102',
  },

  // Tuesday (2)
  {
    id: 'tt-tue-1',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 2,
    subjectId: 'sub-cs304',
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall B-205',
  },
  {
    id: 'tt-tue-2',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 2,
    subjectId: 'sub-cs301',
    startTime: '10:15',
    endTime: '11:15',
    room: 'Hall A-101',
  },
  {
    id: 'tt-tue-3',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 2,
    subjectId: 'sub-cs302',
    startTime: '11:30',
    endTime: '12:30',
    room: 'Hall A-103',
  },

  // Wednesday (3)
  {
    id: 'tt-wed-1',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 3,
    subjectId: 'sub-cs303',
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall B-205',
  },
  {
    id: 'tt-wed-2',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 3,
    subjectId: 'sub-cs304',
    startTime: '10:15',
    endTime: '11:15',
    room: 'Hall B-205',
  },
  {
    id: 'tt-wed-3',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 3,
    subjectId: 'sub-ma301',
    startTime: '11:30',
    endTime: '12:45',
    room: 'Hall C-102',
  },

  // Thursday (4)
  {
    id: 'tt-thu-1',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 4,
    subjectId: 'sub-cs301',
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall A-101',
  },
  {
    id: 'tt-thu-2',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 4,
    subjectId: 'sub-cs302',
    startTime: '10:15',
    endTime: '11:15',
    room: 'Hall A-103',
  },
  {
    id: 'tt-thu-3',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 4,
    subjectId: 'sub-cs304',
    startTime: '11:30',
    endTime: '12:30',
    room: 'Hall B-205',
  },
  {
    id: 'tt-thu-4',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 4,
    subjectId: 'sub-cs303',
    startTime: '14:00',
    endTime: '15:15',
    room: 'Hall B-205',
  },

  // Friday (5)
  {
    id: 'tt-fri-1',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 5,
    subjectId: 'sub-ma301',
    startTime: '09:00',
    endTime: '10:15',
    room: 'Hall C-102',
  },
  {
    id: 'tt-fri-2',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 5,
    subjectId: 'sub-cs303',
    startTime: '10:30',
    endTime: '11:30',
    room: 'Hall B-205',
  },
  {
    id: 'tt-fri-3',
    semesterId: 'sem-fall-2026',
    dayOfWeek: 5,
    subjectId: 'sub-cs301',
    startTime: '11:45',
    endTime: '12:45',
    room: 'Hall A-101',
  },
];

export const INITIAL_HOLIDAYS: AcademicHoliday[] = [
  {
    id: 'hol-1',
    semesterId: 'sem-fall-2026',
    name: 'Labor Day',
    date: '2026-09-07',
    type: 'holiday',
    note: 'Campus closed',
  },
  {
    id: 'hol-2',
    semesterId: 'sem-fall-2026',
    name: 'University Tech Innovation Fest',
    date: '2026-10-15',
    type: 'institutional',
    note: 'No regular lectures, project showcase',
  },
  {
    id: 'hol-3',
    semesterId: 'sem-fall-2026',
    name: 'Mid-Term Reading Day',
    date: '2026-10-23',
    type: 'exam',
    note: 'Study leave before midterms',
  },
  {
    id: 'hol-4',
    semesterId: 'sem-fall-2026',
    name: 'Fall Recess & Thanksgiving',
    date: '2026-11-26',
    type: 'break',
    note: 'Campus closed',
  },
];

export const INITIAL_SPECIAL_CLASSES: SpecialClass[] = [
  {
    id: 'sp-1',
    semesterId: 'sem-fall-2026',
    subjectId: 'sub-cs302',
    date: '2026-09-19',
    startTime: '10:00',
    endTime: '12:00',
    room: 'Database Lab 3',
    reason: 'Extra SQL optimization workshop',
  },
];

// Helper to pre-populate sample attendance for dates up to Sept 25, 2026
export function generateSampleRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  let recordId = 1;

  // Let's seed curated records from late August to Sept 25, 2026
  // This produces accurate, realistic stats showcasing all states:
  // CS 301: 17 attended out of 20 (85.0% - Safe)
  // CS 302: 15 attended out of 16 (93.8% - Very safe)
  // CS 303: 13 attended out of 17 (76.5% - Borderline safe)
  // CS 304: 9 attended out of 13 (69.2% - Shortage, needs 2 classes!)
  // MA 301: 10 attended out of 12 (83.3% - Safe)

  const sampleDates = [
    // Week 1 (Aug 17-21)
    { date: '2026-08-17', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs303', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-ma301', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-08-18', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-08-19', entries: [
      { sub: 'sub-cs303', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs304', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-ma301', status: 'present', slot: '11:30 - 12:45' },
    ]},
    { date: '2026-08-20', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs304', status: 'absent', slot: '11:30 - 12:30', notes: 'Train delay' },
      { sub: 'sub-cs303', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-08-21', entries: [
      { sub: 'sub-ma301', status: 'present', slot: '09:00 - 10:15' },
      { sub: 'sub-cs303', status: 'present', slot: '10:30 - 11:30' },
      { sub: 'sub-cs301', status: 'present', slot: '11:45 - 12:45' },
    ]},

    // Week 2 (Aug 24-28)
    { date: '2026-08-24', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs303', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-ma301', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-08-25', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-08-26', entries: [
      { sub: 'sub-cs303', status: 'absent', slot: '09:00 - 10:00', notes: 'Fever' },
      { sub: 'sub-cs304', status: 'absent', slot: '10:15 - 11:15', notes: 'Fever' },
      { sub: 'sub-ma301', status: 'absent', slot: '11:30 - 12:45', notes: 'Fever - Medical note given' },
    ]},
    { date: '2026-08-27', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs304', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-cs303', status: 'no_class', slot: '14:00 - 15:15', notes: 'Professor on conference leave' },
    ]},
    { date: '2026-08-28', entries: [
      { sub: 'sub-ma301', status: 'present', slot: '09:00 - 10:15' },
      { sub: 'sub-cs303', status: 'present', slot: '10:30 - 11:30' },
      { sub: 'sub-cs301', status: 'present', slot: '11:45 - 12:45' },
    ]},

    // Week 3 (Aug 31 - Sep 4)
    { date: '2026-08-31', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs303', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-ma301', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-01', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'absent', slot: '10:15 - 11:15', notes: 'Dentist appointment' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-09-02', entries: [
      { sub: 'sub-cs303', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs304', status: 'absent', slot: '10:15 - 11:15', notes: 'Overslept' },
      { sub: 'sub-ma301', status: 'present', slot: '11:30 - 12:45' },
    ]},
    { date: '2026-09-03', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs304', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-cs303', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-04', entries: [
      { sub: 'sub-ma301', status: 'present', slot: '09:00 - 10:15' },
      { sub: 'sub-cs303', status: 'absent', slot: '10:30 - 11:30', notes: 'Traffic jam' },
      { sub: 'sub-cs301', status: 'present', slot: '11:45 - 12:45' },
    ]},

    // Week 4 (Sep 7 - 11) (Sep 7 is Labor Day Holiday)
    { date: '2026-09-08', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-09-09', entries: [
      { sub: 'sub-cs303', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs304', status: 'absent', slot: '10:15 - 11:15' },
      { sub: 'sub-ma301', status: 'present', slot: '11:30 - 12:45' },
    ]},
    { date: '2026-09-10', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs304', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-cs303', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-11', entries: [
      { sub: 'sub-ma301', status: 'present', slot: '09:00 - 10:15' },
      { sub: 'sub-cs303', status: 'present', slot: '10:30 - 11:30' },
      { sub: 'sub-cs301', status: 'present', slot: '11:45 - 12:45' },
    ]},

    // Week 5 (Sep 14 - 18)
    { date: '2026-09-14', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs303', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-ma301', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-15', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-09-16', entries: [
      { sub: 'sub-cs303', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs304', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-ma301', status: 'present', slot: '11:30 - 12:45' },
    ]},
    { date: '2026-09-17', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'absent', slot: '10:15 - 11:15', notes: 'Robotics club workshop' },
      { sub: 'sub-cs304', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-cs303', status: 'absent', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-18', entries: [
      { sub: 'sub-ma301', status: 'absent', slot: '09:00 - 10:15' },
      { sub: 'sub-cs303', status: 'present', slot: '10:30 - 11:30' },
      { sub: 'sub-cs301', status: 'absent', slot: '11:45 - 12:45' },
    ]},

    // Special class on Saturday Sep 19
    { date: '2026-09-19', entries: [
      { sub: 'sub-cs302', status: 'present', slot: '10:00 - 12:00', notes: 'Special weekend query lab', isSpecial: true },
    ]},

    // Week 6 (Sep 21 - Sep 25) (Today is Sep 25, 2026)
    { date: '2026-09-21', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs303', status: 'present', slot: '11:30 - 12:30' },
      { sub: 'sub-ma301', status: 'present', slot: '14:00 - 15:15' },
    ]},
    { date: '2026-09-22', entries: [
      { sub: 'sub-cs304', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs301', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs302', status: 'present', slot: '11:30 - 12:30' },
    ]},
    { date: '2026-09-23', entries: [
      { sub: 'sub-cs303', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs304', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-ma301', status: 'present', slot: '11:30 - 12:45' },
    ]},
    { date: '2026-09-24', entries: [
      { sub: 'sub-cs301', status: 'present', slot: '09:00 - 10:00' },
      { sub: 'sub-cs302', status: 'present', slot: '10:15 - 11:15' },
      { sub: 'sub-cs304', status: 'no_class', slot: '11:30 - 12:30', notes: 'Guest lecture cancelled' },
      { sub: 'sub-cs303', status: 'present', slot: '14:00 - 15:15' },
    ]},
    // Today Sep 25, 2026 (Friday) - Scheduled: MA301, CS303, CS301
    // Let's have MA301 marked Present, and CS303 and CS301 ready for the user to mark right now on the dashboard!
    { date: '2026-09-25', entries: [
      { sub: 'sub-ma301', status: 'present', slot: '09:00 - 10:15', notes: 'Attended morning quiz' },
    ]},
  ];

  for (const day of sampleDates) {
    for (const item of day.entries) {
      records.push({
        id: `rec-${recordId++}`,
        semesterId: 'sem-fall-2026',
        subjectId: item.sub,
        date: day.date,
        status: item.status as any,
        timeSlot: item.slot,
        notes: item.notes,
        isSpecialClass: (item as any).isSpecial,
        createdAt: Date.now() - 1000000 + recordId * 1000,
      });
    }
  }

  return records;
}
