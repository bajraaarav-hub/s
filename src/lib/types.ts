export type Student = {
  id: string;
  name: string;
  points: number;
  streak: number;
  rank?: number;
  avatarUrl: string;
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
  date: string;
  status: 'present' | 'absent';
};

export type Grade = {
  subject: string;
  grade: number;
};

export type PastLeaveRequest = {
  startDate: string;
  endDate: string;
  reason: string;
  status: 'approved' | 'rejected';
};
