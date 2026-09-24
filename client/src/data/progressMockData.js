/**
 * Progress Mock Data
 * Aligned with provided VELTRIX visual references (Patient App Screen 7 & Therapist App Screen 6)
 */

export const monthlyProgressStats = {
  completionPercentage: 85,
  completedExercisesCount: 17,
  totalPrescribedExercisesCount: 20,
  totalSessionsThisMonth: 18,
  currentStreakDays: 5,
  averagePainLast7Days: '3.2 / 5',
  completedSessionsCount: 15,
  completedSessionsPercentage: 83,
  missedSessionsCount: 3,
  missedSessionsPercentage: 17,
};

export const monthlyPainTrendData = [
  { week: 'Week 1', pain: 4.5 },
  { week: 'Week 2', pain: 3.8 },
  { week: 'Week 3', pain: 2.9 },
  { week: 'Week 4', pain: 1.8 },
];

export const sessionHistoryRecords = [
  {
    id: 'sh-1',
    date: '24 May 2024',
    exercise: 'Arm Raise',
    setsReps: '3 / 10',
    painBefore: 4,
    painAfter: 2,
    difficulty: 'Moderate',
    status: 'Completed',
  },
  {
    id: 'sh-2',
    date: '22 May 2024',
    exercise: 'Shoulder Stretch',
    setsReps: '3 / 30 sec',
    painBefore: 3,
    painAfter: 2,
    difficulty: 'Easy',
    status: 'Completed',
  },
  {
    id: 'sh-3',
    date: '20 May 2024',
    exercise: 'Wall Push Up',
    setsReps: '3 / 12',
    painBefore: 4,
    painAfter: 3,
    difficulty: 'Moderate',
    status: 'Completed',
  },
  {
    id: 'sh-4',
    date: '18 May 2024',
    exercise: 'Arm Raise',
    setsReps: '3 / 10',
    painBefore: 5,
    painAfter: 4,
    difficulty: 'Difficult',
    status: 'Completed',
  },
  {
    id: 'sh-5',
    date: '16 May 2024',
    exercise: 'Rest Day',
    setsReps: '-',
    painBefore: '-',
    painAfter: '-',
    difficulty: '-',
    status: 'Missed',
  },
];
