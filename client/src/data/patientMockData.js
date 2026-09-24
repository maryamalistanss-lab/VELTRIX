/**
 * Patient Visual Mock Data
 * Aligned with provided VELTRIX visual references (Rahul Mehta / Zoha)
 */

export const currentPatientProfile = {
  id: 'pt-101',
  name: 'Rahul Mehta',
  preferredName: 'Rahul',
  email: 'rahul.mehta@email.com',
  age: 28,
  condition: 'Knee Recovery',
  primaryJoint: 'Knee',
  streakDays: 5,
  completionRate: 75,
  weeklyCompliance: 92,
  totalMinutesThisWeek: 340,
  assignedTherapist: 'Dr. Priya Sharma',
  therapistNote: 'Focus on slow and controlled movement. Consistency is the key to recovery. - Dr. Sharma',
  nextExercise: {
    id: 'ex-wall-slides',
    title: 'Wall Slides',
    sets: 3,
    reps: 12,
    duration: '6 mins',
    status: 'In Progress',
  },
};

export const todaysPrescribedExercises = [
  {
    id: 'ex-knee-extension',
    title: 'Knee Extension',
    targetArea: 'Knee',
    difficulty: 'Beginner',
    sets: 3,
    reps: 10,
    restTime: '30 sec',
    progress: 100,
    status: 'Completed',
    instructions: [
      'Sit on a chair with back straight.',
      'Extend your leg slowly until horizontal.',
      'Hold for 2 seconds at peak extension.',
      'Return to starting position slowly.',
    ],
  },
  {
    id: 'ex-arm-raise',
    title: 'Arm Raise',
    targetArea: 'Shoulders',
    difficulty: 'Beginner',
    sets: 3,
    reps: 10,
    restTime: '30 sec',
    progress: 50,
    status: 'In Progress',
    instructions: [
      'Stand upright with feet shoulder-width apart.',
      'Raise both arms forward smoothly to shoulder height.',
      'Hold for 2 seconds at the top.',
      'Lower your arms back down with control.',
    ],
  },
  {
    id: 'ex-shoulder-stretch',
    title: 'Shoulder Stretch',
    targetArea: 'Shoulders',
    difficulty: 'Beginner',
    sets: 3,
    reps: 15,
    restTime: '30 sec',
    progress: 0,
    status: 'Pending',
    instructions: [
      'Gently bring one arm across your chest.',
      'Use opposite hand to support elbow.',
      'Hold stretch for 30 seconds.',
      'Switch sides and repeat.',
    ],
  },
];

export const weeklyPainTrend = [
  { day: 'Mon', pain: 4.2 },
  { day: 'Tue', pain: 3.8 },
  { day: 'Wed', pain: 3.2 },
  { day: 'Thu', pain: 2.8 },
  { day: 'Fri', pain: 2.4 },
  { day: 'Sat', pain: 2.1 },
  { day: 'Sun', pain: 1.8 },
];
