import type {Student, Homework, AttendanceRecord, Grade, PastLeaveRequest} from './types';

export const mainStudent: Student = {
  id: 'student-01',
  name: 'Alex Johnson',
  points: 1250,
  streak: 12,
  avatarUrl: 'https://picsum.photos/seed/101/100/100',
};

export const homeworkAssignments: Homework[] = [
  {
    id: 'hw-01',
    title: 'Math & English Homework',
    requiredBooks: ['Math Textbook', 'English Notebook', 'Science Workbook'],
  },
  {
    id: 'hw-02',
    title: 'History Project',
    requiredBooks: ['History Textbook', 'World Atlas'],
  },
];

export const currentBackpackContents: string[] = ['Math Textbook', 'History Textbook', 'Laptop'];

export const leaderboardData: Student[] = [
  {id: 'student-02', name: 'Benny Carter', points: 1500, streak: 15, avatarUrl: 'https://picsum.photos/seed/102/100/100'},
  {id: 'student-01', name: 'Alex Johnson', points: 1250, streak: 12, avatarUrl: 'https://picsum.photos/seed/101/100/100'},
  {id: 'student-03', name: 'Chloe Davis', points: 1100, streak: 8, avatarUrl: 'https://picsum.photos/seed/103/100/100'},
  {id: 'student-04', name: 'David Evans', points: 950, streak: 5, avatarUrl: 'https://picsum.photos/seed/104/100/100'},
  {id: 'student-05', name: 'Eva Foster', points: 800, streak: 3, avatarUrl: 'https://picsum.photos/seed/105/100/100'},
];

export const attendanceHistory: AttendanceRecord[] = [
  {date: '2024-05-01', status: 'present'},
  {date: '2024-05-02', status: 'present'},
  {date: '2024-05-03', status: 'absent'},
  {date: '2024-05-06', status: 'present'},
  {date: '2024-05-07', status: 'absent'},
];

export const studentGrades: Grade[] = [
  {subject: 'Math', grade: 85},
  {subject: 'English', grade: 92},
  {subject: 'Science', grade: 78},
  {subject: 'History', grade: 88},
];

export const pastLeaveRequests: PastLeaveRequest[] = [
  {startDate: '2024-04-15', endDate: '2024-04-15', reason: 'Doctor appointment', status: 'approved'},
  {startDate: '2024-03-10', endDate: '2024-03-12', reason: 'Family trip', status: 'rejected'},
];
