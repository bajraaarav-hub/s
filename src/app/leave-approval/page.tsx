'use client';

import { LeaveApprovalClient } from '@/components/leave-approval-client';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { LeaveRequest, Student } from '@/lib/types';
import { collectionGroup, query, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LeaveApprovalPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);
  const { data: teacher, isLoading: isTeacherLoading } = useDoc<Student>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (!isTeacherLoading && teacher?.role !== 'teacher') {
        router.push('/');
    }
  }, [isUserLoading, user, router, isTeacherLoading, teacher]);

  const leaveRequestsQuery = useMemoFirebase(() => {
    if (!firestore || !teacher || teacher.role !== 'teacher') return null;
    return query(
        collectionGroup(firestore, 'leaveRequests'),
        where('status', '==', 'pending')
    );
  }, [firestore, teacher]);

  const { data: leaveRequests, isLoading: areLeaveRequestsLoading } = useCollection<LeaveRequest>(leaveRequestsQuery);

  if (isUserLoading || isTeacherLoading || areLeaveRequestsLoading || !teacher ) {
    return <div>Loading...</div>;
  }
  
  if (teacher.role !== 'teacher') {
    return <div>Access Denied. You must be a teacher to view this page.</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Approval</h1>
        <p className="text-muted-foreground">Review and manage student leave requests with AI-powered insights.</p>
      </div>
      <LeaveApprovalClient pendingRequests={leaveRequests || []} />
    </div>
  );
}
