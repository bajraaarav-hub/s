export type Student = {
  id: string;
  name: string;
  points: number;
  streak: number;
  rank?: number;
  avatarUrl?: string;
  role?: 'student' | 'teacher';
};

export type Homework = {
  id: string;
  title: string;
  requiredBooks: string[];
};

export type CurrentBooks = {
  id: string;
  bookIds: string[];
}

export type AttendanceRecord = {
  id: string;
  date: string;
  status: 'present' | 'absent';
};

export type Grade = {
  id: string;
  subject: string;
  grade: number;
};

export type PastLeaveRequest = {
  startDate: string;
  endDate: string;
  reason: string;
  status: 'approved' | 'rejected';
};

export type LeaveRequest = {
    id: string;
    studentId: string;
    studentName: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    summary?: string;
    riskScore?: number;
}
