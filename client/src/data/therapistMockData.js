/**
 * Therapist Visual Mock Data
 * Aligned with provided VELTRIX visual references (Dr. Priya Sharma)
 */

export const currentClinicianProfile = {
  id: 'th-101',
  name: 'Dr. Priya Sharma',
  role: 'Lead Physical Therapist',
  department: 'Musculoskeletal Rehabilitation',
  avatarInitials: 'PS',
};

export const therapistDashboardMetrics = {
  totalPatients: { value: 12, delta: '↑ 2 this week', isPositive: true },
  activeExercises: { value: 18, delta: '↑ 3 this week', isPositive: true },
  sessionsThisWeek: { value: 42, delta: '↑ 15%', isPositive: true },
  completionRate: { value: '84%', delta: '↑ 5%', isPositive: true },
};

export const recentActivities = [
  {
    id: 'act-1',
    patientName: 'Rahul Mehta',
    action: 'completed Arm Raise',
    time: 'Today, 10:30 AM',
    status: 'completed',
  },
  {
    id: 'act-2',
    patientName: 'Ananya',
    action: 'completed Shoulder Stretch',
    time: 'Today, 09:15 AM',
    status: 'completed',
  },
  {
    id: 'act-3',
    patientName: 'Arjun',
    action: 'missed Wall Push Up',
    time: 'Yesterday, 04:20 PM',
    status: 'missed',
  },
  {
    id: 'act-4',
    patientName: 'Neha',
    action: 'completed Arm Raise',
    time: 'Yesterday, 02:45 PM',
    status: 'completed',
  },
];

export const sessionsOverviewWeekly = [
  { day: 'Mon', sessions: 4 },
  { day: 'Tue', sessions: 6 },
  { day: 'Wed', sessions: 5 },
  { day: 'Thu', sessions: 8 },
  { day: 'Fri', sessions: 7 },
  { day: 'Sat', sessions: 9 },
  { day: 'Sun', sessions: 3 },
];

export const topPerformingPatients = [
  { id: 'pt-201', name: 'Ananya Verma', completionRate: 96 },
  { id: 'pt-101', name: 'Rahul Mehta', completionRate: 88 },
  { id: 'pt-202', name: 'Neha Kapoor', completionRate: 85 },
];

export const todaysPendingAlerts = [
  { id: 'pnd-1', count: 2, text: 'Patients have pending exercises', type: 'warning' },
  { id: 'pnd-2', count: 3, text: 'Sessions need to be reviewed', type: 'info' },
];

export const clinicalPatientDirectory = [
  {
    id: 'pt-101',
    name: 'Rahul Mehta',
    age: 28,
    condition: 'Knee Recovery',
    completionRate: 86,
    lastActive: 'Today',
    status: 'Active',
  },
  {
    id: 'pt-201',
    name: 'Ananya Verma',
    age: 34,
    condition: 'Shoulder Pain',
    completionRate: 92,
    lastActive: 'Today',
    status: 'Active',
  },
  {
    id: 'pt-203',
    name: 'Arjun Singh',
    age: 31,
    condition: 'Back Pain',
    completionRate: 67,
    lastActive: 'Yesterday',
    status: 'Attention Needed',
  },
  {
    id: 'pt-202',
    name: 'Neha Kapoor',
    age: 26,
    condition: 'Post Surgery',
    completionRate: 75,
    lastActive: 'Today',
    status: 'Active',
  },
  {
    id: 'pt-204',
    name: 'Vikram Patel',
    age: 40,
    condition: 'Knee Recovery',
    completionRate: 88,
    lastActive: '2 days ago',
    status: 'Active',
  },
  {
    id: 'pt-205',
    name: 'Sneha Iyer',
    age: 29,
    condition: 'Shoulder Pain',
    completionRate: 81,
    lastActive: 'Yesterday',
    status: 'Active',
  },
];
