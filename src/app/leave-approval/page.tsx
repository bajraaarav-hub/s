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
            collectionGroup(firestore, 'leaveRequests'),
            where('status', '==', 'pending')
        );
    }, [firestore]);

    const { data: leaveRequests, isLoading: areLeaveRequestsLoading } = useCollection<LeaveRequest>(leaveRequestsQuery);
    
    if (areLeaveRequestsLoading) {
        return <div>Loading leave requests...</div>;
    }

    return <LeaveApprovalClient pendingRequests={leaveRequests || []} />;
}


export default function LeaveApprovalPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    // Only create the doc ref if we have a user
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  // Fetch the user's document
  const { data: userData, isLoading: isUserDocLoading } = useDoc<Student>(userDocRef);

  // Redirect non-users or non-teachers
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    // Once user doc is loaded, check the role.
    if (!isUserDocLoading && userData && userData.role !== 'teacher') {
      router.push('/');
    }
  }, [isUserLoading, user, isUserDocLoading, userData, router]);

  // Determine loading state
  const isLoading = isUserLoading || isUserDocLoading;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Leave Approval</h1>
        <p className="text-muted-foreground">Review and manage student leave requests with AI-powered insights.</p>
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : userData?.role === 'teacher' ? (
        // Only render the component that makes the sensitive query if the user is a teacher.
        <TeacherLeaveRequestList />
      ) : (
        // Optional: show a message if the user is not a teacher but somehow landed here.
        // The useEffect above should handle redirection.
        <div>Access Denied. You must be a teacher to view this page.</div>
      )}
    </div>
  );
}

    