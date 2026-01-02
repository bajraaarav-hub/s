'use client';
import {DashboardClient} from '@/components/dashboard-client';
import {mainStudent, homeworkAssignments, leaderboardData} from '@/lib/data';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { useEffect } from 'react';
import { collection, query, doc, limit } from 'firebase/firestore';
import type { Student, Homework } from '@/lib/types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [isUserLoading, user, router]);

    // Seed data for demonstration - only runs when a user is available
    useEffect(() => {
        if (firestore && user) {
         // Seed current books for main student, but tied to the current user
        const currentBooksRef = doc(firestore, 'users', user.uid, 'currentBooks', 'initial-books');
        setDocumentNonBlocking(currentBooksRef, { studentId: user.uid, id: 'initial-books', bookIds: ['Math Textbook', 'History Textbook', 'Laptop'] }, { merge: true });
        }
    }, [firestore, user]);

    const studentDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

    const homeworkQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'homework'), limit(1));
    }, [firestore, user]);
    const { data: homework, isLoading: isHomeworkLoading } = useCollection<Homework>(homeworkQuery);
    
    const leaderboardQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'users'));
    }, [firestore, user]);
    const { data: leaderboard, isLoading: isLeaderboardLoading } = useCollection<Student>(leaderboardQuery);
    
    if (isUserLoading || !user || isStudentLoading || isHomeworkLoading || isLeaderboardLoading) {
        return <div>Loading...</div>;
    }
    
    const rankedLeaderboard = leaderboard
    ? [...leaderboard]
        .sort((a, b) => b.points - a.points)
        .map((s, index) => ({ ...s, rank: index + 1 }))
    : [];
    
    const currentStudent = student || { ...mainStudent, id: user?.uid || mainStudent.id, name: "Anonymous Panda" };

  return (
    <DashboardClient
      student={currentStudent}
      homework={homework?.[0] || homeworkAssignments[0]}
      leaderboard={rankedLeaderboard}
    />
  );
}
