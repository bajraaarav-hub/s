'use client';

import { LeaveApprovalClient } from '@/components/leave-approval-client';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { LeaveRequest, Student } from '@/lib/types';
import { collectionGroup, query, where, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// A component to fetch and display leave requests, only rendered when we know the user is a teacher.
function TeacherLeaveRequestList() {
    const firestore = useFirestore();
    const leaveRequestsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        // This query runs only when this component is rendered.
        return query(
            collectionGroup(firestore, 'leaveRequests')
        );
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
  const router = useRouter();

  // Redirect non-users
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Approval</h1>
        <p className="text-muted-foreground">Review and manage student leave requests with AI-powered insights.</p>
      </div>
      {isUserLoading ? (
        <div>Loading...</div>
      ) : (
        <TeacherLeaveRequestList />
      )}
    </div>
  );
}
