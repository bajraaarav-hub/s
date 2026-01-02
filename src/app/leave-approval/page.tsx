'use client';

import { LeaveApprovalClient } from '@/components/leave-approval-client';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { LeaveRequest, Student } from '@/lib/types';
import { collectionGroup, query, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// A component to fetch and display leave requests, only rendered when we know the user is a teacher.
function TeacherLeaveRequestList() {
    const firestore = useFirestore();
    
    const leaveRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collectionGroup(firestore, 'leaveRequests'));
    }, [firestore]);

    const { data: leaveRequests, isLoading: areLeaveRequestsLoading } = useCollection<LeaveRequest>(leaveRequestsQuery);
    
    if (areLeaveRequestsLoading) {
        return <div>Loading leave requests...</div>;
    }

    const pendingRequests = (leaveRequests || []).filter(req => req.status === 'pending');

    return <LeaveApprovalClient pendingRequests={pendingRequests} />;
}


export default function LeaveApprovalPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDocLoading } = useDoc<Student>(userDocRef);

  if (isUserLoading || isUserDocLoading) {
    return <div>Loading...</div>;
  }

  const isTeacher = userData?.role === 'teacher';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Approval</h1>
        <p className="text-muted-foreground">Review and manage student leave requests with AI-powered insights.</p>
      </div>
      {isTeacher ? (
        <TeacherLeaveRequestList />
      ) : (
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      )}
    </div>
  );
}
