'use client';

import { LeaveRequestHelper } from '@/components/leave-request-helper';
import { studentGrades, attendanceHistory, pastLeaveRequests } from '@/lib/data';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Student } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LeaveRequestsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  if (isUserLoading || isStudentLoading || !student) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Request Helper</h1>
        <p className="text-muted-foreground">Submit leave requests and get AI-powered insights for approval.</p>
      </div>
      <LeaveRequestHelper
        student={student}
        grades={studentGrades}
        attendance={attendanceHistory}
        pastRequests={pastLeaveRequests}
      />
    </div>
  );
}
